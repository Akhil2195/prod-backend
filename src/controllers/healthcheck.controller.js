const healthCheck = (req,res) => {
    res.send({
        success: 1,
        message: 'Success'
    })
};

export default healthCheck;