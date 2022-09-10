import * as dayjs from "dayjs";
import request from "./request";

const isWorkday = (d: string) => ["一", "二", "三", "四", "五"].includes(d);

export async function isHoliday(query: string) {
  let data: any;
  const now = new Date();
  const url = `https://opendata.baidu.com/api.php?tn=wisetpl&format=json&resource_id=39043&query=${encodeURIComponent(
    query
  )}&t=${now.getTime()}&cb=cb`;
  console.log(url);
  try {
    const res = await request.get(url);
    data = res.data;
  } catch (e) {
    return Promise.reject(e);
  }

  data = data.slice(7, data.length - 2);
  let dayInfo: any = {};
  try {
    data = JSON.parse(data);

    const { almanac = {} } = data.data[0];
    const d = now.getDate();
    dayInfo = almanac[d];
  } catch (e) {
    return Promise.reject("接口返回数据格式化异常");
  }

  if (dayInfo.status === 2) {
    // 法定补假日
    return false;
  } else if (dayInfo.status === 1) {
    // 法定节假日
    return true;
  }
  if (isWorkday(dayInfo.cnDay)) {
    return false;
  }
  return true;
}
export async function isTodayHoliday() {
  const now = dayjs();
  return isHoliday(`${now.year()}年${+now.month() + 1}月`);
}
