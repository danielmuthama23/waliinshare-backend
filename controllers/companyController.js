import CompanyValue from '../models/CompanyValue.js';

export const getCompanyValue = async (req, res) => {
  try {
    const value = await CompanyValue.findOne();
    res.json(value);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching company value' });
  }
};

export const updateCompanyValue = async (req, res) => {
  try {
    const data = req.body;
    let record = await CompanyValue.findOne();

    if (record) {
      Object.assign(record, data);
      await record.save();
    } else {
      record = await CompanyValue.create(data);
    }

    res.json({ message: 'Company value updated', value: record });
  } catch (err) {
    res.status(500).json({ message: 'Error updating company value' });
  }
};