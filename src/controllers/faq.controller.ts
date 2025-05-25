import { Request, Response } from "express";
import FAQ from "../models/faq.model";
import { success, failure } from "../utilities/common";
import HTTP_STATUS from "../constants/statusCodes";

const createFAQ = async (req: Request, res: Response) => {
  try {
    const { question, answer } = req.body;
    if (!question || !answer) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .send(failure("Please provide question and answer"));
    }
    const faq = new FAQ(req.body);
    if (!faq) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .send(failure("faq not created, please try again"));
    }
    await faq.save();
    return res
      .status(HTTP_STATUS.CREATED)
      .send(success("FAQ created successfully", faq));
  } catch (error) {
    console.error(error);
    return res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send(failure("Internal server error"));
  }
};

const getAllFAQs = async (req: Request, res: Response) => {
  try {
    const faqs = await FAQ.find();
    return res
      .status(HTTP_STATUS.OK)
      .send(success("Successfully retrieved FAQs", faqs));
  } catch (error) {
    console.error(error);
    return res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send(failure("Internal server error"));
  }
};

const getFAQById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const faq = await FAQ.findById(id);
    if (!faq) {
      return res.status(HTTP_STATUS.NOT_FOUND).send(failure("FAQ not found"));
    }
    return res
      .status(HTTP_STATUS.OK)
      .send(success("Successfully retrieved FAQ", faq));
  } catch (error) {
    console.error(error);
    return res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send(failure("Internal server error"));
  }
};

const updateFAQById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updatedFAQ = await FAQ.findByIdAndUpdate(id, req.body, { new: true });
    if (!updatedFAQ) {
      return res.status(HTTP_STATUS.NOT_FOUND).send(failure("FAQ not found"));
    }
    return res
      .status(HTTP_STATUS.OK)
      .send(success("FAQ updated successfully", updatedFAQ));
  } catch (error) {
    console.error(error);
    return res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send(failure("Internal server error"));
  }
};

const deleteFAQById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deletedFAQ = await FAQ.findByIdAndDelete(id);
    if (!deletedFAQ) {
      return res.status(HTTP_STATUS.NOT_FOUND).send(failure("FAQ not found"));
    }
    return res
      .status(HTTP_STATUS.OK)
      .send(success("FAQ deleted successfully", deletedFAQ));
  } catch (error) {
    console.error(error);
    return res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send(failure("Internal server error"));
  }
};

export { createFAQ, getAllFAQs, getFAQById, updateFAQById, deleteFAQById };
