const Donor = require('../models/Donor');

/**
 * Prioritize milk donation distribution
 * @param {Array} recipients - List of recipients with urgency and distance
 * @returns {Array} Sorted list of priority matches
 */
const calculateMilkPriority = (recipients, availableMilk) => {
    // Priority score = (Urgency * 0.7) + (1 / Distance * 0.3)
    return recipients.map(r => ({
        ...r,
        priorityScore: (r.urgency * 10) + (1000 / (r.distance + 1))
    })).sort((a, b) => b.priorityScore - a.priorityScore);
};

module.exports = { calculateMilkPriority };
