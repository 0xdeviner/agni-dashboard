module.exports = function makeSubdomainModel(db) {
    const col = db.collection('subdomains');
  
    return {
      countAll: () => col.countDocuments(),
      countLive: () => col.countDocuments({ alive_data: { $exists: true } }),
      countTakeovers: () => col.countDocuments({ takeover: { $exists: true } }),
  
      listRecent: (limit = 20) => col.find({}).sort({ _id: -1 }).limit(limit).toArray(),
  
      listByDomain: async (domain, { is_alive, has_takeover } = {}, page = 1, limit = 20) => {
        const skip = (page - 1) * limit;
        const query = { domain };
        if (is_alive === true) query.alive_data = { $exists: true };
        if (has_takeover === true) query.takeover = { $exists: true };
  
        const [items, total] = await Promise.all([
          col.find(query).sort({ subdomain: 1 }).skip(skip).limit(limit).toArray(),
          col.countDocuments(query)
        ]);
        return { items, total, page, limit };
      },
  
      search: async (
        { domain, subdomain, is_alive, has_takeover, status_code, q } = {},
        page = 1,
        limit = 20
      ) => {
        const skip = (page - 1) * limit;
        const query = {};
        if (domain) query.domain = domain;
        if (subdomain) query.subdomain = { $regex: subdomain, $options: 'i' };
        if (is_alive === true) query.alive_data = { $exists: true };
        if (has_takeover === true) query.takeover = { $exists: true };
        if (status_code != null) {
          const code = parseInt(status_code, 10);
          if (!Number.isNaN(code)) query['alive_data.status_code'] = code;
        }
        if (q) {
          query.$or = [
            { subdomain: { $regex: q, $options: 'i' } },
            { domain: { $regex: q, $options: 'i' } }
          ];
        }
  
        const [items, total] = await Promise.all([
          col.find(query).sort({ subdomain: 1 }).skip(skip).limit(limit).toArray(),
          col.countDocuments(query)
        ]);
        return { items, total, page, limit };
      },
  
      listTakeovers: async (page = 1, limit = 20) => {
        const skip = (page - 1) * limit;
        const query = { takeover: { $exists: true } };
        const [items, total] = await Promise.all([
          col.find(query).sort({ subdomain: 1 }).skip(skip).limit(limit).toArray(),
          col.countDocuments(query)
        ]);
        return { items, total, page, limit };
      },
  
      exportSubdomains: async ({ domain, is_alive, has_takeover } = {}) => {
        const query = {};
        if (domain) query.domain = domain;
        if (is_alive === true) query.alive_data = { $exists: true };
        if (has_takeover === true) query.takeover = { $exists: true };
  
        const items = await col
          .find(query, { projection: { subdomain: 1 } })
          .sort({ subdomain: 1 })
          .toArray();
        return items.map((s) => s.subdomain);
      },
  
      exportTakeovers: async () => {
        const items = await col
          .find({ takeover: { $exists: true } }, { projection: { subdomain: 1 } })
          .sort({ subdomain: 1 })
          .toArray();
        return items.map((s) => s.subdomain);
      }
    };
  };