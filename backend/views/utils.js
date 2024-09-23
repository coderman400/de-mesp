

const isAuthenticated = (req, res, next) => {
    if (req.session && req.session.walletId) {
        next(); // User is authenticated, proceed to the next middleware or route handler
    } else {
        res.status(401).json({ message: 'Login required' }); // User is not authenticated
    }
};


export default isAuthenticated;