import { ObjectId } from 'mongoose';

export interface IRayObject {
  _id?: ObjectId;
  createAt: Date;
  rayInSievert: number;
  dataSource: IRayObjectSource;
}

export enum IRayObjectSource {
  fubuki_hmt = 'fubuki_hmt',
  fubuki_sz = 'fubuki_sz',
}
