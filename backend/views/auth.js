import express from 'express'
import { User } from '../models/user.js';
import { fileURLToPath } from 'url';
import path from 'path';
import { generateUniqueNickname } from '../utils/nameGeneration.js';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const router = express.Router();

router.post('/register', async (req, res) => {
    const { metamaskId, role } = req.body;
    if (!metamaskId || !role) {
      return res.status(400).json({ message: 'Metamask ID and role are required' });
    }
  
    try {
      const existingUser = await User.findOne({ userAddress:metamaskId });
      if (existingUser) {
        return res.status(400).json({ message: 'User already registered with this Metamask ID' });
      }
  
      const nickname = await generateUniqueNickname();
      const newUser = new User({
        userAddress: metamaskId.toLowerCase(),
        userRole: role,
        nickName:nickname,
      });
      await newUser.save();
      res.status(201).json({
        message: 'User registered successfully',
        user: {
          metamaskId: newUser.userAddress,
          role: newUser.userRole,
          nickname: newUser.nickName
        }
      });
    } catch (error) {
      console.error('Error registering user:', error);
      res.status(500).json({ message: 'Server error, please try again later' });
    }
});

router.get('/login', async (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'register.html'));
})
  

router.post('/login', async (req, res) => {
  const { metamaskId } = req.body;
  if (!metamaskId) {
    return res.status(400).json({ message: 'Wallet ID is required' });
  }

  try {
    const user = await User.findOne({ userAddress:metamaskId }); 

    if (!user) {
      return res.json({ role: "none" });
    }
    res.json({role: user.userRole }); // Return the user's role
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


export default router;