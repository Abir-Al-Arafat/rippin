import { Request, Response } from "express";
import Terms from "../models/terms.model";
import { success, failure } from "../utilities/common";
import HTTP_STATUS from "../constants/statusCodes";

const createTerms = async (req: Request, res: Response) => {
  try {
    const { content } = req.body;
    if (!content) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .send(failure("Please provide terms content"));
    }
    const existingTerms = await Terms.findOne();
    if (existingTerms) {
      await existingTerms.updateOne({ content });
      return res
        .status(HTTP_STATUS.OK)
        .send(success("Terms updated successfully", existingTerms));
    }
    const terms = new Terms({ content });
    if (!terms) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .send(failure("Terms not created, please try again"));
    }
    await terms.save();
    return res
      .status(HTTP_STATUS.CREATED)
      .send(success("Terms created successfully", terms));
  } catch (error) {
    console.error(error);
    return res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send(failure("Internal server error"));
  }
};

const getAllTerms = async (req: Request, res: Response) => {
  try {
    const terms = await Terms.find();
    return res
      .status(HTTP_STATUS.OK)
      .send(success("Successfully retrieved terms", terms));
  } catch (error) {
    console.error(error);
    return res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send(failure("Internal server error"));
  }
};

const getTermsById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const terms = await Terms.findById(id);
    if (!terms) {
      return res.status(HTTP_STATUS.NOT_FOUND).send(failure("Terms not found"));
    }
    return res
      .status(HTTP_STATUS.OK)
      .send(success("Successfully retrieved terms", terms));
  } catch (error) {
    console.error(error);
    return res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send(failure("Internal server error"));
  }
};

const deleteTermsById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deletedTerms = await Terms.findByIdAndDelete(id);
    if (!deletedTerms) {
      return res.status(HTTP_STATUS.NOT_FOUND).send(failure("Terms not found"));
    }
    return res
      .status(HTTP_STATUS.OK)
      .send(success("Terms deleted successfully", deletedTerms));
  } catch (error) {
    console.error(error);
    return res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send(failure("Internal server error"));
  }
};

const deleteAllTerms = async (req: Request, res: Response) => {
  try {
    const deletedTerms = await Terms.deleteMany();
    return res
      .status(HTTP_STATUS.OK)
      .send(success("Terms deleted successfully", deletedTerms));
  } catch (error) {
    console.error(error);
    return res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send(failure("Internal server error"));
  }
};

export {
  createTerms,
  getAllTerms,
  getTermsById,
  //   updateTermsById,
  deleteTermsById,
  deleteAllTerms,
};
