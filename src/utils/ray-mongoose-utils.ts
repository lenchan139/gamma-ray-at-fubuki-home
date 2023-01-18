import { IRayObject, IRayObjectSource } from '@/interfaces/ray.interface';
import * as mongoose from 'mongoose';
export class RayMongooseUtils {
    private mongoose_instance: Promise<mongoose.Mongoose>;
    private RaySchema: mongoose.Schema<IRayObject>;
    private RayT: mongoose.Model<IRayObject>;

    constructor() {
        try {
            const mongo_url = process?.env?.MONGODB_FULLURL || '';
            if (mongo_url) {
                this.mongoose_instance = mongoose.connect(mongo_url);
                this.RaySchema = new mongoose.Schema<IRayObject>({
                    _id: {
                        type: mongoose.Types.ObjectId,
                        default: function () {
                            return new mongoose.Types.ObjectId();
                        },
                    },
                    createAt: Date,
                    rayInSievert: Number,
                    dataSource: String,
                });
                this.RayT = mongoose.model('RayRecord', this.RaySchema);
            } else {
                console.error('no db url setup');
                // throw Error("o db url setup")
            }
        } catch (e) {
            console.error('setup mongoose with error', e);
            // throw e
        }
    }
    async recordNewRay(sv_number: number, type: IRayObjectSource) {
        const ray: IRayObject = {
            createAt: new Date(),
            rayInSievert: sv_number,
            dataSource: type,
        };
        const rayObject = new this.RayT(ray);
        try {
            const r = await rayObject.save();
            return r;
        } catch (e) {
            console.error(e);
            return null;
        }
    }

    async queryRecords(q: { dateBefore?: Date; dateAfter?: Date; sourceType?: IRayObjectSource }) {
        const currentDate = new Date();
        const lastMonthDate = new Date(currentDate.getTime() - 1000 * 60 * 60 * 24 * 30);
        const query: mongoose.FilterQuery<IRayObject> = {};

        if (q?.sourceType) {
            query.dataSource = q.sourceType;
        }
        if (q?.dateAfter && q?.dateBefore) {
            query.createAt = {
                $gte: q.dateAfter,
                $lte: q.dateBefore,
            };
        } else if (q?.dateAfter) {
            query.createAt = {
                $gte: q.dateAfter,
            };
        } else if (q?.dateBefore) {
            query.createAt = {
                $lte: q.dateBefore,
            };
        }
        console.log('incoming query', q);
        console.log('fquery', query)
        const result = await this.RayT.find(query).sort(
            { 'createAt': 'desc' }
        );
        return result;
    }
}
