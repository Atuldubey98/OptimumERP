const plansService = require("../../services/plans.service");
const getPlans = async (req, res) => {
    const plans = await plansService.getPlans();

    const currentPlan = req?.session?.user?.currentPlan;
    return res.json({
        success: true,
        data: {
            plans,
            currentPlan
        },
    })
};
module.exports = {
    getPlans,
};