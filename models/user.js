module.exports = function makeDomainModel(db) {
    const col = db.collection('domains');
  
    return {
      countAll: () => col.countDocuments(),
      listPaginated: async (page = 1, limit = 20) => {
        const skip = (page - 1) * limit;
        const [items, total] = await Promise.all([
          col.find({}).sort({ domain: 1 }).skip(skip).limit(limit).toArray(),
          col.countDocuments()
        ]);
        return { items, total, page, limit };
      }
    };
  };