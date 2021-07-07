const mongoose = require("mongoose");

// user schema
const UserSchema = new mongoose.Schema({
  // email field
  email: {
    type: String,
    required: [true, "Please provide an Email!"],
    unique: [true, "Email Exist"],
  },

  //   password field
  password: {
    type: String,
    required: [true, "Please provide a password!"],
    unique: false,
  },
  dob: {
    type: String,
    required: false,
    unique: false,
  },
  jobsAppliedFor: {
    type: Array,
    required: false,
    unique: false,
  },
  name:{
    type: String,
    required:false,
    unique: false,
  },
  currentJob:{
    type: String,
    required:false,
    unique:false,
  },
  area: {
    type: String,
    required:false,
    unique:false,
  },
  isValid: {
    type:Boolean,
     required:false,
     unique: false,
  },

});

// export UserSchema
module.exports = mongoose.model.jobsApplied || mongoose.model("jobsApplied", UserSchema);
