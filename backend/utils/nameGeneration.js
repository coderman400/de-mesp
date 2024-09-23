const { uniqueNamesGenerator, adjectives, colors, animals } = require('unique-names-generator');
const { User } = require('../models/user.js'); // Adjust the path if needed

// Function to generate a unique nickname
const generateUniqueNickname = async () => {
  let nickname;
  let isUnique = false;

  // Keep generating a new nickname until it's unique in the database
  while (!isUnique) {
    nickname = uniqueNamesGenerator({
      dictionaries: [adjectives, colors, animals], // Use adjectives, colors, and animals as dictionaries
      separator: '-',  // Use '-' to separate the parts of the nickname
      length: 3        // Length of nickname will be 3 words
    });

    // Check if the nickname already exists in the database
    const existingUser = await User.findOne({ nickname });
    if (!existingUser) {
      isUnique = true;
    }
  }
  
  return nickname;
};

module.exports = { generateUniqueNickname };
