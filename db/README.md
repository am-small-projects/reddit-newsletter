# reconciler-ddl-sam

Using the SAM Pipeline model, we can now version control updates to any RDS instance in AWS

# Pre-requisites

We need to keep certain files LOCKED to avoid inadvertant changes. We will need to install a GIT utility called LFS (Large File Storage) for that.

1. Install GIT LFS on your computer: `brew install git-lfs`
2. Install LFS in your github repo: `git lfs install`
3. To view the existing locks: `git lfs locks`

## Defaults

The default basis changelog file is the db.changelog-master.xml in this repo. ALL additional SQL updates/modifications to the RDS database should be done in db.changelog-1.X.xml where the 'X' is incremented for each changeset. And the new db.changelog-1.X.xml file is then appended to the db.changelog-master.xml file

## Changelog Master Stucture

The changesets will execute in the order they are included in the master changelog file. This means a changeset must follow the changesets on which it depends. The current recommended order is:

1. Schema changesets
2. Table changesets
3. View changesets
4. Function changesets
5. Trigger changesets

There are two different types of changesets:

1. Those that will be run once and should never be modified.
2. Those that will be run every time and should have changes made directly to the existing changelog file.

Changesets that should only ever be run once would include _SCHEMA_ operations, _TABLE_ operations, and _TRIGGER_ operations when the trigger would need to operate on existing data.

Changesets that should be run every time would include _VIEW_ operations, _FUNCTION_ operations, and _TRIGGER_ operations when the trigger would only need to operate on new/changed data.

## Changeset Numbering

```
0.x = Roles and Permissions
1.x = Extensions
2.x = SCHEMA initial changeset
3.x = Tables
    3.1 = internal_in TABLE initial changeset
    3.2 = echelon_in TABLE initial changeset
    3.3 = echelon_filesinfo TABLE initial changeset
    3.4 = reconciler TABLE initial changeset

4.x = Indexes
5.x = Views
6.x = Functions
7.x = Triggers
8.x = Static Data
```

Additional run once changeset numbers should be the initial changeset number with a _.X_ appended. Where X is incremental.
EX:

```
3.4.1 is the first additional changeset to the reconciler TABLEs
3.4.2 is the second additional changeset to the reconciler TABLEs
```

## New Run Once Changeset - Best Practice

Run once changesets should be an sql file located in the appropriate _changelogs_ directory.
The filename should be _db.changelog-<< changeset_number >>.sql_.
The file must start with:

```sql
--liquibase formatted sql

--changeset <<author_name>>:<<changeset_number>>-<<changeset_title>>
```

The file should be included in the changelog master immediately below the preceding changeset.
EX:

```xml
<include file="/changelogs/tables/db.changelog-0.1.sql"/>
<include file="/changelogs/tables/db.changelog-0.1.1.sql"/>
<include file="/changelogs/tables/db.changelog-0.1.X.sql"/>
```

## Modify Run Once Changeset - Best Practice

**_DON'T_** - it will not work, you will get frustrated, and you might irreversibly break something.

## New Run Every Time Changeset - Best Practice

**_FIRST_** - verify that the needed changeset files do not already exist, if they do, just modify them.
Run every time changesets should have an xml file located in the appropriate _changelogs_ directory and an sql file located in the appropriate _sql_ directory.

The xml file filename should be _db.changelog-<< changeset_number >>.xml_.
The xml file should look like:

```xml
<databaseChangeLog
    xmlns="http://www.liquibase.org/xml/ns/dbchangelog"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xmlns:ext="http://www.liquibase.org/xml/ns/dbchangelog-ext"
    xsi:schemaLocation="http://www.liquibase.org/xml/ns/dbchangelog http://www.liquibase.org/xml/ns/dbchangelog/dbchangelog-3.6.xsd
    http://www.liquibase.org/xml/ns/dbchangelog-ext http://www.liquibase.org/xml/ns/dbchangelog/dbchangelog-ext.xsd">

    <changeSet author="<<author_name>>" id="<<changeset_number>>-<<changeset_title>>" runAlways="true">
        <validCheckSum>ANY</validCheckSum>
        <sqlFile dbms="postgresql"
            encoding="utf8"
            endDelimiter="\nGO"
            path="<<sql_file_path_relative_to_this_xml_file>>"
            relativeToChangelogFile="true"
            splitStatements="true"
            stripComments="false" />
    </changeSet>
</databaseChangeLog>
```

The _runAlways_ attribute tells Liquibase to always execute this changeset.
The _<validCheckSum>ANY</validCheckSum>_ sub-tag tells Liquibase not to validate the changeset's checksum. Otherwise modifications to the files will cause validation to fail and prevent all remaining changesets from executing.
The xml file should be included in the changelog master with similar run every time changesets.
EX:

```xml
<include file="/changelogs/views/db.changelog-1.0.xml"/>
```

The sql file filename should be named to easily identify what types of changes are being made.

- The sql file should contain only sql and may contain comments.
- Every CREATE should either be CREATE OR REPLACE or immediately preceded by a DROP **\_** IF EXISTS.
- Always assume the object you are creating/updating simultaneously exists and does not exist at the same time.

## Modify Run Every Time Changeset - Best Practice

- Change whatever you need to change and add whatever you need to add to the sql file, but the xml file probably does not need to be modified.
- Every CREATE should either be CREATE OR REPLACE or immediately preceded by a DROP **\_** IF EXISTS.
- Every static data INSERT should be preceded by a TRUNCATE TABLE.
- Always assume the object you are creating/updating simultaneously exists and does not exist at the same time.

## BuildSpec

The buildspec does the heavy lifting here:

1. Pulls RECONCILER database values from SSM
1. Installs LiquiBase with postgresql JDBC driver
1. Sets up the liquibase.properties file
1. Executes the _liquibase validate_ command as a "unit test"
1. Finally, executes the _liquibase update_ command to actually update the RDS instance

## Run Liquibase Locally

1. Install PostgreSQL

```bash
brew install postgresql
```

2. Install PostGIS

```bash
brew install postgis
```

3. Install Liquibase

```bash
brew install liquibase
```

4. Set the Liquibase location env var

```bash
export LIQUIBASE_HOME=/usr/local/opt/liquibase/libexec
```

5. Start PostgreSQL

```bash
pg_ctl -D /usr/local/var/postgres start && brew services start postgresql
```

6. Create a new database
7. Download the appropriate postgres driver (ex. postgresql-42.2.6.jar) into the root directory of this repo
   - Link for Download: https://jdbc.postgresql.org/download.html
   - All the .jar files will be ignored by git (check .gitignore)
8. Create a _liquibase.properties_ file in the root directory of this repo (All .properties files will automatically be ignored by Git)

```
changeLogFile=db.changelog-master.xml
driver=org.postgresql.Driver
classpath=postgresql-42.2.6.jar
url=jdbc:postgresql://localhost:5432/<<your_local_database_name>>
username=<<your_local_database_username>>
password=<<your_local_database_password>>
referenceUrl=jdbc:postgresql://localhost:5432/<<your_local_database_name>>
referenceUsername=<<your_local_database_username>>
referencePassword=<<your_local_database_password>>
```

11. Run Liquibase
    Output SQL w/o modifying the DB:

```bash
liquibase updateSQL
```

Modify the DB:

```bash
liquibase update
```

## Resetting the DB

1. DROP the schemas that are created by Liquibase. (sql can be found in `changelogs/schemas/db.changelog-2.0.xml`)
2. TRUNCATE TABLE public.databasechangelog;
3. TRUNCATE TABLE public.databasechangeloglock;

## Troubleshooting

**PROBLEM: My changeset is using 'sql' or 'sqlFile' tags and executed without error, but my SQL is not being output when I execute updateSQL.**

> _POSSIBLE SOLUTIONS:_
>
> 1. Verify that your 'dbms' attribute is correct (usually needs to be lowercase)
> 2. Verify that your 'encoding' attribute is correct
> 3. For 'sqlFile', verify that your 'path' and 'relativeToChangelogFile' attributes are correct

## CODEOWNER Notes

**Locks should be placed on any runOnce changelog file**

- (Codeowners ONLY) To Lock a file: `git lfs lock [/folder/]example.ext`
- (Codeowners ONLY) To Unlock a file: `git lfs unlock [/folder/]example.ext` (a git admin should be able to `--force` an unlock)
- If you 'own' the lock on a file, you will be allowed to modify it without unlocking it.
- When squashing existing runOnce changelogs into a single file, be sure to unlock the changelog before deleting it.

## Caveats

1. Do not move buildspec.yml out of the root directory

## References

1. http://www.liquibase.org/documentation/index.html
1. https://medium.com/@Python_Primer/how-i-used-liquibase-and-cloudformation-to-version-and-instrument-my-rds-db-6915e73d8c88
1. https://hackernoon.com/dont-install-postgres-docker-pull-postgres-bee20e200198
