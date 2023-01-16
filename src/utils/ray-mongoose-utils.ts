import { IRayObject, IRayObjectSource } from '@/interfaces/ray.interface'
import e from 'express'
import * as mongoose from 'mongoose'
export class RayMongooseUtils {
    private mongoose_instance: Promise<mongoose.Mongoose>
    private RaySchema: mongoose.Schema<IRayObject>
    private RayT: mongoose.Model<IRayObject>

    constructor() {
        try {
            const mongo_url = process?.env?.MONGODB_FULLURL || ''
            if (mongo_url) {

                this.mongoose_instance = mongoose.connect(mongo_url)
                this.RaySchema = new mongoose.Schema<IRayObject>({
                    _id:    {type:mongoose.Types.ObjectId, default: function () { return new mongoose.Types.ObjectId()} },
                    createAt: Date,
                    rayInSievert: Number,
                    dataSource: String,
                });
                this.RayT = mongoose.model('RayRecord', this.RaySchema)
            } else {
                console.error('no db url setup')
                // throw Error("o db url setup")
            }
        } catch (e) {
            console.error('setup mongoose with error', e)
            // throw e
        }
    }
    async recordNewRay(sv_number: number, type: IRayObjectSource) {
        const ray: IRayObject = {
            createAt: new Date(),
            rayInSievert: sv_number,
            dataSource: type,
        }
        const rayObject = new this.RayT(ray)
        try {

            const r = await rayObject.save()
            return r;
        } catch (e) {
            console.error(e)
            return null;
        }
    }
    async getLastDayRayRecord() {
        const currentDate = new Date()
        const lastMonthDate = new Date(currentDate.getTime() - (1000 * 60 * 60 * 24 * 30))
        const result = await this.RayT.find({
            createAt: { $gte: lastMonthDate }
        });
        return result;
    }

    async getAllBySrouce(s:IRayObjectSource) {
        const currentDate = new Date()
        const lastMonthDate = new Date(currentDate.getTime() - (1000 * 60 * 60 * 24 * 30))
        const result = await this.RayT.find({
            dataSource: s
        });
        return result;
    }
}