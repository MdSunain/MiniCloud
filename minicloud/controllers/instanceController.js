import Instance from '../models/instancemodel.js';

// const User = require("../models/userModel");

// Create instance
export const createInstance = async (req, res) => {
  try {
    const { name, type } = req.body;
    const instance = await Instance.create({ name, type });
    res.json({ message: 'Instance created', instance });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create instance' });
  }
};

// List all instances
export const listInstances = async (req, res) => {
  try {
    const instances = await Instance.find();
    res.json(instances);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch instances' });
  }
};

// Stop instance
export const stopInstance = async (req, res) => {
  try {
    const { id } = req.params;
    const instance = await Instance.findByIdAndUpdate(id, { status: 'stopped' }, { new: true });
    res.json({ message: 'Instance stopped', instance });
  } catch (error) {
    res.status(500).json({ error: 'Failed to stop instance' });
  }
};

// Start instance
export const startInstance = async (req, res) => {
  try {
    const { id } = req.params;
    const instance = await Instance.findByIdAndUpdate(id, { status: 'running' }, { new: true });
    res.json({ message: 'Instance started', instance });
  } catch (error) {
    res.status(500).json({ error: 'Failed to start instance' });
  }
};

// Delete instance
export const deleteInstance = async (req, res) => {
  try {
    const { id } = req.params;
    await Instance.findByIdAndDelete(id);
    res.json({ message: 'Instance deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete instance' });
  }
};
