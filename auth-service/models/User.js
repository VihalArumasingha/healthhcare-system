const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firebaseId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  role: {
    type: String,
    enum: ['patient', 'doctor', 'admin'],
    required: true
  },
  name: {
    type: String,
    required: true
  },
  phoneNumber: {
    type: String
  },
  address: {
    type: String
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: function() {
      // Patients and Admins are approved by default
      return this.role === 'doctor' ? 'pending' : 'approved';
    }
  },
  activeStatus: {
    type: String,
    enum: ['Active', 'Suspended', 'Deleted'],
    default: 'Active'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);
