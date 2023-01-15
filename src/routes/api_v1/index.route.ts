import { Routes } from "@/interfaces/routes.interface";
import { Router } from "express";
import RayRoute from "./ray.route";

class ApiV1Route implements Routes {
    public path = '/api_v1';
    public router = Router();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.get(`${this.path}`,(req,res)=>res.json({
          success:true,
        }))
        this.router.use(`${this.path}/ray`, new RayRoute().router)
    }
}

export default ApiV1Route;
