import jwt from 'jsonwebtoken'

export function authenticateToken(req, res, next) {
    const header = req.headers.authorization;
    const token = header.split(' ')[1];

    if (!token) {
        return res.status(401).json({error: 'No token provided'});
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({error: 'Invalid token'});
        }
        req.user = user;
        next();
    })
}