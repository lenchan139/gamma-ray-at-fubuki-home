import * as Gsheet from 'google-spreadsheet'
export class RayGSheetUtils {
    private rayDocRef

    constructor() {
        this.rayDocRef = new Gsheet.GoogleSpreadsheet(process.env.RAY_GSHEET_ID)
    }
}