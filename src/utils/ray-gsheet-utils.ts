import { IRayObject } from '@/interfaces/ray.interface'
import * as Gsheet from 'google-spreadsheet'
import * as fs from 'fs'
export class RayGSheetUtils {
    private rayDocRef: Gsheet.GoogleSpreadsheet
    private credentialPath = `./google-credentials.json`
    private get sheetSID() {
        return process.env.RAY_GSHEET_SID
    }
    constructor() {
        this.rayDocRef = new Gsheet.GoogleSpreadsheet(process.env.RAY_GSHEET_ID)

        //   console.log('google credential',{
        //     s:credJson,
        //   })
        // this.reloadDocInfo()
    }

    private async reloadDocInfo() {
        const credJson = fs.readFileSync(this.credentialPath, {
            encoding: 'utf-8',
        })
        await this.rayDocRef.useServiceAccountAuth(JSON.parse(credJson))
        await this.rayDocRef.loadInfo();
    }
   async addRayToSheetRow(id: string, ray: IRayObject) {
       await this.reloadDocInfo()
        const sheet = this.rayDocRef.sheetsById[this.sheetSID];
        const result = await sheet.addRow([
            id, 
            ray.createAt.toISOString(),
            ray.dataSource,
            ray.rayInSievert,
        ])
        return result||null;
    }
}