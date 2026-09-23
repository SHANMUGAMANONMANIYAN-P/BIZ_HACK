const RequestHistory = require('../models/RequestHistory');

const recordHistory = async ({
  requestId,
  changedBy,
  previousStatus = '',
  newStatus = '',
  action,
  notes = '',
}) => {
  try {
    const history = await RequestHistory.create({
      requestId,
      changedBy,
      previousStatus,
      newStatus,
      action,
      notes,
    });
    return history;
  } catch (error) {
    console.error('Error recording request history:', error);
    return null;
  }
};

module.exports = { recordHistory };
