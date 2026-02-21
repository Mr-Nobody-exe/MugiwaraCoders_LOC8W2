import Event from '../models/Event.js';
import asyncHandler from '../utils/asyncHandler.js';
import { success, error, notFound } from '../utils/apiResponse.js';
import logger from '../utils/logger.js';

// @desc  Create a new hackathon event
// @route POST /api/events
// @access Admin
export const createEvent = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    venue,
    startDate,
    endDate,
    deadlines,
    meals,
    maxTeamSize,
    minTeamSize,
  } = req.body;

  const event = await Event.create({
    title,
    description,
    venue,
    startDate,
    endDate,
    deadlines,
    meals,
    maxTeamSize,
    minTeamSize,
    createdBy: req.user._id,
  });

  logger.info(`Event created: ${event.title} by admin ${req.user._id}`);
  res.status(201).json(success(event, 'Event created successfully', 201));
});

// @desc  Get all active events
// @route GET /api/events
// @access Public
export const getAllEvents = asyncHandler(async (_req, res) => {
  const events = await Event.find({ isActive: true })
    .populate('createdBy', 'name email')
    .sort({ createdAt: -1 });

  res.json(success(events, 'Events fetched'));
});

// @desc  Get single event by ID
// @route GET /api/events/:id
// @access Public
export const getEventById = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id)
    .populate('createdBy', 'name email')
    .populate('judges', 'name email');

  if (!event) return res.status(404).json(notFound('Event not found'));

  res.json(success(event, 'Event fetched'));
});

// @desc  Update event details
// @route PATCH /api/events/:id
// @access Admin
export const updateEvent = asyncHandler(async (req, res) => {
  const event = await Event.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!event) return res.status(404).json(notFound('Event not found'));

  logger.info(`Event updated: ${event._id}`);
  res.json(success(event, 'Event updated'));
});

// @desc  Toggle event active/inactive
// @route PATCH /api/events/:id/status
// @access Admin
export const toggleEventStatus = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) return res.status(404).json(notFound('Event not found'));

  event.isActive = !event.isActive;
  await event.save();

  res.json(success({ isActive: event.isActive }, `Event ${event.isActive ? 'activated' : 'deactivated'}`));
});

// @desc  Add a problem statement to an event
// @route POST /api/events/:id/problem-statements
// @access Admin
export const addProblemStatement = asyncHandler(async (req, res) => {
  const { title, description, domain } = req.body;

  const event = await Event.findById(req.params.id);
  if (!event) return res.status(404).json(notFound('Event not found'));

  event.problemStatements.push({ title, description, domain });
  await event.save();

  res.status(201).json(success(event.problemStatements, 'Problem statement added', 201));
});

// @desc  Assign a judge to an event
// @route POST /api/events/:id/judges
// @access Admin
export const assignJudge = asyncHandler(async (req, res) => {
  const { judgeId } = req.body;

  const event = await Event.findById(req.params.id);
  if (!event) return res.status(404).json(notFound('Event not found'));

  if (event.judges.includes(judgeId)) {
    return res.status(409).json(error('Judge already assigned to this event', 409));
  }

  event.judges.push(judgeId);
  await event.save();

  await event.populate('judges', 'name email');
  res.json(success(event.judges, 'Judge assigned'));
});