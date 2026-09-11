export class SelectHelper {
  static async SelectTitleList(patData: any, title_list: any) {
    let select_title_list = null;

    let prename = patData.prename?.trim() || "";
    if (prename === "น.ส.") {
      prename = "นางสาว";
    } else if (prename === "ด.ช.") {
      prename = "เด็กชาย";
    } else if (prename === "ด.ญ.") {
      prename = "เด็กหญิง";
    } else {
      prename = patData.prename?.trim();
    }

    if (prename) {
      const matched = title_list.find((item: any) =>
        item.name.includes(prename),
      );
      if (matched) {
        select_title_list = matched;
      } else {
        // มีค่าเข้ามาแต่ไม่ตรง ให้ใช้ "อื่นๆ" (code: 8)
        select_title_list = title_list.find((item: any) => item.code === 8) || {
          code: 8,
          name: "8 อื่นๆ",
        };
      }
    } else {
      // ไม่มีค่าเข้ามา ให้ใช้ "ไม่ระบุ" (code: 9)
      select_title_list = title_list.find((item: any) => item.code === 9) || {
        code: 9,
        name: "9 ไม่ระบุ",
      };
    }
    return select_title_list;
  }

  static async SelectNationalityList(patData: any, nationlity_list: any) {
    const race_name = patData.race_name?.trim();

    let select_nationlity_list = null;

    if (race_name) {
      // ค้นหาตัวที่ชื่อมีคำตรงกับ race_name (เช่น '1 ไทย' มีคำว่า 'ไทย')
      const matched = nationlity_list.find((item: any) =>
        item.name.includes(race_name),
      );
      if (matched) {
        select_nationlity_list = matched;
      } else {
        // มีค่าเข้ามาแต่ไม่ตรง ให้ใช้ "อื่นๆ" (code: 8)
        select_nationlity_list = nationlity_list.find(
          (item: any) => item.code === 8,
        ) || {
          code: 8,
          name: "8 อื่นๆ",
        };
      }
    } else {
      // ไม่มีค่าเข้ามา ให้ใช้ "ไม่ระบุ" (code: 9)
      select_nationlity_list = nationlity_list.find(
        (item: any) => item.code === 9,
      ) || {
        code: 9,
        name: "9 ไม่ระบุ",
      };
    }
    return select_nationlity_list;
  }
}
