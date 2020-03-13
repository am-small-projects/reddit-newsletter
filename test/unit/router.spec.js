const { expect } = require("chai"); // for assertions and expectations
const request = require("supertest"); // for http requests
const { createSandbox, assert } = require("sinon"); // for sandbox, stubbing and mocking
const controller = require("../../app/src/controller");
const service = require("../../app/src/service");

const sandbox = createSandbox();

describe("Unit Tests: Router", () => {
  let server;
  let controllerAddUserStub;
  let controllerUpdateUserStub;
  let controllerUpdateSubscriptionStub;
  let controllerAddFavoriteChannelStub;
  let serviceNewsletterStub;
  beforeEach(async () => {
    // initialize or stub the various things
    server = require("../../app");
    controllerAddUserStub = sandbox.stub(controller, "addUser");
    controllerUpdateUserStub = sandbox.stub(controller, "updateUser");
    controllerUpdateSubscriptionStub = sandbox.stub(
      controller,
      "updateSubscription"
    );
    controllerAddFavoriteChannelStub = sandbox.stub(
      controller,
      "addFavoriteChannel"
    );
    serviceNewsletterStub = sandbox.stub(service, "newsletterService");
  });
  afterEach(async () => {    
    sandbox.restore();
    await server.close();
  });

  describe("Route: POST /user", () => {
    it("Success Case: should return user id when user is successfully created", async () => {
      const requestBody = {
        firstName: "First",
        lastName: "Last",
        email: "first.last@something.com"
      };
      const funcResponse = "6a109d3e-b4b5-452b-b0de-b5d1f0583860";
      controllerAddUserStub.resolves(funcResponse);

      request(server)
        .post("/user")
        .set("content-type", "application/x-www-form-urlencoded")
        .send(requestBody)
        .end((error, response) => {
          if (error) {
            console.log(error);
          } else {
            expect(response.statusCode).to.equal(200);
            expect(response.body.message).to.equal("User created successfully");
            expect(response.body.userId).to.equal(funcResponse);
          }
        });
    });
    it("Failure Case: should return 500 if user is not created", async () => {
      const requestBody = {
        firstName: "First"
      };
      const funcResponse = false;
      controllerAddUserStub.resolves(funcResponse);

      request(server)
        .post("/user")
        .set("content-type", "application/x-www-form-urlencoded")
        .send(requestBody)
        .end((error, response) => {
          if (error) {
            console.log(error);
          } else {
            expect(response.statusCode).to.equal(500);
            expect(response.body.message).to.equal("Server Error");
          }
        });
    });
  });
  describe("Route: PATCH /user/:id", () => {
    it("Success Case: should return 201 when user is successfully updated", async () => {
      const requestBody = {
        firstName: "First",
        lastName: "Last",
        email: "first.last@something.com",
        timezone: "America/Denver"
      };
      const reqParam = "6a109d3e-b4b5-452b-b0de-b5d1f0583860";
      controllerUpdateUserStub.resolves(true);

      request(server)
        .patch(`/user/${reqParam}`)
        .set("content-type", "application/x-www-form-urlencoded")
        .send(requestBody)
        .end((error, response) => {
          if (error) {
            console.log(error);
          } else {
            expect(response.statusCode).to.equal(201);
            expect(response.body.message).to.equal("User updated successfully");
          }
        });
    });
    it("Failure Case: should return 500 if user is not updated", async () => {
      const requestBody = {
        firstName: "First"
      };
      const reqParam = "6a109d3e-b4b5-452b-b0de-b5d1f0583860";
      controllerUpdateUserStub.resolves(false);

      request(server)
        .patch(`/user/${reqParam}`)
        .set("content-type", "application/x-www-form-urlencoded")
        .send(requestBody)
        .end((error, response) => {
          if (error) {
            console.log(error);
          } else {
            expect(response.statusCode).to.equal(500);
            expect(response.body.message).to.equal("Server Error");
          }
        });
    });
  });
  describe("Route: POST /user/newsletter/subscribe", () => {
    it("Success Case: should return success message when user subscription is successful", async () => {
      const requestBody = {
        email: "first.last@something.com",
        timezone: "America/Denver"
      };
      const funcResponse = "6a109d3e-b4b5-452b-b0de-b5d1f0583860";
      controllerAddUserStub.resolves(funcResponse);
      serviceNewsletterStub.resolves();

      request(server)
        .post("/user/newsletter/subscribe")
        .set("content-type", "application/x-www-form-urlencoded")
        .send(requestBody)
        .end((error, response) => {
          if (error) {
            console.log(error);
          } else {
            console.log(response.body);
            expect(response.statusCode).to.equal(200);
            expect(response.body.message).to.equal(
              "User subscribed to newsletter successfully"
            );
            expect(response.body.userId).to.equal(funcResponse);
          }
        });
    });
    it("Failure Case: should return 500 if user is not subscribed to newsletter", async () => {
      const requestBody = {
        timezone: "America/Denver"
      };
      const funcResponse = false;
      controllerAddUserStub.resolves(funcResponse);
      serviceNewsletterStub.resolves();

      request(server)
        .post("/user/newsletter/subscribe")
        .set("content-type", "application/x-www-form-urlencoded")
        .send(requestBody)
        .end((error, response) => {
          if (error) {
            console.log(error);
          } else {
            expect(response.statusCode).to.equal(500);
            expect(response.body.message).to.equal("Server Error");
          }
        });
    });
  });
  describe("Route: PATCH /user/:email/newsletter/preferences", () => {
    it("Success Case: should return 201 when preferences are successfully updated", async () => {
      const requestBody = {
        subscribe: "yes"
      };
      const reqParam = "first.last@something.com";
      controllerUpdateSubscriptionStub.resolves(true);
      serviceNewsletterStub.resolves();

      request(server)
        .patch(`/user/${reqParam}/newsletter/preferences`)
        .set("content-type", "application/x-www-form-urlencoded")
        .send(requestBody)
        .end((error, response) => {
          if (error) {
            console.log(error);
          } else {
            expect(response.statusCode).to.equal(201);
            expect(response.body.message).to.equal(
              "User preferences updated successfully"
            );
          }
        });
    });
    it("Failure Case: should return 500 if user is not updated", async () => {
      const requestBody = {
        firstName: "First"
      };
      const reqParam = "first.last@something.com";
      controllerUpdateSubscriptionStub.resolves(false);
      serviceNewsletterStub.resolves();

      request(server)
        .patch(`/user/${reqParam}/newsletter/preferences`)
        .set("content-type", "application/x-www-form-urlencoded")
        .send(requestBody)
        .end((error, response) => {
          if (error) {
            console.log(error);
          } else {
            expect(response.statusCode).to.equal(500);
            expect(response.body.message).to.equal("Server Error");
          }
        });
    });
  });

  describe("Route: POST /user/:id/favorites/reddit/channel", () => {
    it("Success Case: should return success message if channel is added successfully", async () => {
      const requestBody = {
        type: "Technology",
        url: "http://www.reddit.com/r/technology"
      };
      const reqParam = "6a109d3e-b4b5-452b-b0de-b5d1f0583860";
      controllerAddFavoriteChannelStub.resolves(true);

      request(server)
        .post(`/user/${reqParam}/favorites/reddit/channel`)
        .set("content-type", "application/x-www-form-urlencoded")
        .send(requestBody)
        .end((error, response) => {
          if (error) {
            console.log(error);
          } else {
            expect(response.statusCode).to.equal(200);
            expect(response.body.message).to.equal(
              "Favorite reddit channel for user added successfully"
            );
          }
        });
    });
    it("Failure Case: should return 500 if channel is not added", async () => {
      const requestBody = {
        type: "Technology"
      };
      const reqParam = "6a109d3e-b4b5-452b-b0de-b5d1f0583860";
      controllerAddFavoriteChannelStub.resolves(false);

      request(server)
        .post(`/user/${reqParam}/favorites/reddit/channel`)
        .set("content-type", "application/x-www-form-urlencoded")
        .send(requestBody)
        .end((error, response) => {
          if (error) {
            console.log(error);
          } else {
            expect(response.statusCode).to.equal(500);
            expect(response.body.message).to.equal("Server Error");
          }
        });
    });
  });
});
