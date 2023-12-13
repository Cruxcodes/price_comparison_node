const chai = require("chai");
const chaiHttp = require("chai-http");
const { describe, it } = require("mocha");
const { app } = require("./app"); // Assuming your Express app is exported from a file

chai.use(chaiHttp);
chai.should();

describe("Express Server Endpoints", () => {
  it("should search for keyboards by name", (done) => {
    chai
      .request(app)
      .get("/search?search=apple")
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.have.property("data");
        res.body.data.should.be.an("array");
        done();
      });
  });

  it("should check for duplicates in keyboard IDs", (done) => {
    chai
      .request(app)
      .get("/checkDuplicateKeyboardId?keyboardId=1")
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.have.property("keyboardId");
        res.body.should.have.property("hasDuplicates");
        done();
      });
  });

  it("should get a random list of keyboards", (done) => {
    chai
      .request(app)
      .get("/random")
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.have.property("data");
        res.body.data.should.be.an("array");
        done();
      });
  });

  it("should get a list of keyboards with the same ID but different colors", (done) => {
    chai
      .request(app)
      .get("/getKeyboards?keyboardId=1")
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.have.property("data");
        res.body.data.should.be.an("array");
        done();
      });
  });

  it("should get a specific keyboard detail by ID", (done) => {
    chai
      .request(app)
      .get("/getKeyboardDetailById?keyboardId=1")
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.have.property("data");
        res.body.data.should.be.an("array");
        done();
      });
  });

  it("should get comparisons for a specific keyboard details ID", (done) => {
    chai
      .request(app)
      .get("/getComparisonsByDetailId?keyboardId=1234")
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.have.property("data");
        res.body.data.should.be.an("array");
        done();
      });
  });
});
