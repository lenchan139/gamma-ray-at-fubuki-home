import { IRayObject, IRayObjectSource } from '@/interfaces/ray.interface';
import { RayGSheetUtils } from '@/utils/ray-gsheet-utils';
import { RayMongooseUtils } from '@/utils/ray-mongoose-utils';
import { RayNotionApiUtils } from '@/utils/ray-notion-api-utils';
import { config } from 'dotenv';
import { NextFunction, Request, Response } from 'express';
import { Parser as CsvParser } from '@json2csv/plainjs';
class RayController {
  private mongodbUtils: RayMongooseUtils = new RayMongooseUtils();
  private notionApiUtils: RayNotionApiUtils = new RayNotionApiUtils();
  private gsheetUtils: RayGSheetUtils = new RayGSheetUtils();

  public recordIncomingRay = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // this is post method,
    console.log('incoming body', req.body);
    const ray_raw_number = req.body?.sv;
    const raw_source = req.body?.source;
    const arrIRSource = Object.values(IRayObjectSource);
    const expectSecretToken = process.env.THIS_API_SENSITIVE_SECRET;
    const secretToken = req.headers.authorization;
    const parsed_sv_number = parseFloat(ray_raw_number || '');
    if (expectSecretToken) {
      // have expect token, so must check it.
      const prefixBearer = 'Bearer ';
      if (secretToken && secretToken.startsWith('Bearer ') && secretToken == `${prefixBearer}${expectSecretToken}`) {
        // correct format , bypass it.
        console.log('bearer passed');
      } else {
        res.json({
          success: false,
          error_code: 'invalid_bearer_token',
        });
        return;
      }
    }
    if (!ray_raw_number || !raw_source) {
      // no params
      res.json({
        success: false,
        error_code: 'please_pass_all_params_[sv,source]',
        incoming_body: req.body || null,
      });
      return;
    } else if (ray_raw_number && isNaN(ray_raw_number)) {
      // not a number
      res.json({
        success: false,
        error_code: 'not_a_valid_sv_number',
        incoming_body: req.body || null,
      });
      return;
    } else if (!arrIRSource.includes(raw_source)) {
      // not valid source type
      res.json({
        success: false,
        error_code: 'not_valid_srouce',
        accept_type: arrIRSource,
        incoming_body: req.body || null,
      });
      return;
    } else {
      // all checking passed
      try {
        const r = await this.mongodbUtils.recordNewRay(parsed_sv_number, raw_source);
        if (r?._id) {
          const notionResult = await this.notionApiUtils.addRowToRay(String(r._id), r);
          const gsheetResult = await this.gsheetUtils.addRayToSheetRow(String(r._id), r);
          res.json({
            success: true,
            _id: String(r._id),
            result_notion: notionResult ? true : false,
            result_gshhet: gsheetResult ? true : false,
          });
          return;
        } else {
          res.json({
            success: false,
            error_code: 'unknown_error',
          });
          return;
        }
      } catch (e) {
        console.log('error', e);
        res.json({
          success: false,
          error_code: 'write_error:' + e.String(),
          error_body: e,
          incoming_body: req.body || null,
        });
        return;
      }
    }
  };

  public queryRecords = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    console.log('vvvv');
    const dateBeforeStr = req.query?.before;
    const dateAfterStr = req.query?.after;
    const sourceType = req.query?.source;
    const format = req.query?.format;
    const limit = parseInt((<any>req.query?.limit) || '0')
    let before: Date = null;
    let after: Date = null;
    let source: IRayObjectSource | null = null;
    const arrIRSource = Object.values(IRayObjectSource);
    if (dateBeforeStr && typeof dateAfterStr == 'string') {
      const d = new Date(dateBeforeStr.toString());
      if (d?.getTime()) {
        before = d;
      } else {
        res.json({
          success: false,
          error_code: 'invalid_before_date',
        });
        return;
      }
    }
    if (dateAfterStr) {
      const d = new Date(dateAfterStr.toString());
      if (d?.getTime()) {
        after = d;
      } else {
        res.json({
          success: false,
          error_code: 'invalid_after_date',
        });
        return;
      }
    }
    if (sourceType) {
      if (arrIRSource.includes(<any>sourceType)) {
        source = <IRayObjectSource>sourceType;
      } else {
        res.json({
          success: false,
          error_code: `invalid_source_type`,
          accept_source_type: `[${arrIRSource.join(',')}]`,
        });
        return;
      }
    }
    console.log('vvvv');
    try {
      const r = await this.mongodbUtils.queryRecords({
        dateAfter: after,
        dateBefore: before,
        sourceType: source,
        limit: limit && !isNaN(limit) ? limit : null,
      });
      console.log('vvvv', 2);
      let arr: IRayObject[] = [];
      if (r?.length) arr = r.map(v => <IRayObject>v);
      const y = await this.notionApiUtils.getRayDatabase();
      if (format == 'csv') {

        try {
          const parser = new CsvParser();
          const csv = parser.parse(r.map(v=>v.toJSON()));
          // console.log(csv);
          res.attachment('results.csv').send(csv)
        } catch (err) {
          console.error(err);
        }
      } else {

        res.json({
          success: true,
          data: r,
        });
        return;
      }

    } catch (e) {
      console.error('error', e)
      res.json({
        success: false,
        error_code: 'write_error:' + e.String(),
        error_body: e,
      });
      return;
    }
  };
}

export default RayController;
