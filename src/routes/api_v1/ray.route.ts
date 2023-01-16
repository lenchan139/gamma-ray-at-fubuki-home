import RayController from "@/controllers/api_v1/ray.controller";
import { Routes } from "@/interfaces/routes.interface";
import { Router } from "express";

class RayRoute implements Routes {
  //   public path = '/ray';
  public router = Router();
  private rayController = new RayController()

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get('/test', (req, res) => res.json({
      success: true,
    }))
    this.router.get('/', this.rayController.getLastMonthRecords)
    this.router.get('/:source', this.rayController.getAllRecordBySource)
    this.router.post('/', this.rayController.recordIncomingRay)
  }
}

export default RayRoute;
