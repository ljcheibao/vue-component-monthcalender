import "./index.less";
import "./base.js";
const Utils = require("heibao-utils");
import {
  Component,
  Emit,
  Watch,
  Prop,
  Vue
} from 'vue-property-decorator';
import { Calender } from "./CalenderModel";
//@ts-ignore
import { swiper, swiperSlide } from 'vue-awesome-swiper';

@Component({
  template: require("./index.html"),
  components: {
    swiper,
    swiperSlide
  }
})

/**
 * 月份日历组件
 * @class
 * @extends {Vue}
 */
export default class MonthCalender extends Vue {

  /**
   * 定义日历组件接收的options可选项属性
   */
  @Prop()
  private option: Calender.CalenderOptions;

  @Prop()
  value: boolean;

  //监听value值的变更
  @Watch("value")
  watchValueChange(newVal: any): void {
    this.visible = newVal;
  }

  //控制弹框的显示
  visible: boolean = this.value;

  /**
   * 设置每月对应的天数
   */
  private monthDays: object = {
    1: 31,
    2: 28,
    3: 31,
    4: 30,
    5: 31,
    6: 30,
    7: 31,
    8: 31,
    9: 30,
    10: 31,
    11: 30,
    12: 31
  }

  /**
   * 今天的日期
   */
  private today: string = Utils.dateFormat("yyyy-MM-dd", new Date());

  /**
   * 当前月第一天日期
   */
  private todayMonth: string = Utils.dateFormat("yyyy-MM", new Date()) + "-01";

  /**
   * 变更日历的状态
   * @todo: 自定义更改每天日期状态，后续版本扩展
   * @param calenderDayStatus 每天日期的状态
   */
  // calenderDayStatusExchange(calenderDayStatus) {
  //   this.calenderDayStatus = calenderDayStatus;
  //   //今天
  //   let today = this.today;
  //   //默认天
  //   let defaultDay = Utils.dateFormat("yyyy-MM-dd", this.calendarOption.currentDate);
  //   let swiperMonth = this.swiperMonthDate ? Utils.dateFormat("yyyy-MM", this.swiperMonthDate) : null;
  //   for (let item of this.calenderDayStatus) {
  //     let month = Utils.dateFormat("yyyy-MM", Utils.createCorrectDate(item.currentDate));
  //     if (swiperMonth && month != swiperMonth) continue;
  //     for (let item1 of this.monthCalender.monthDayList) {
  //       let month1 = Utils.dateFormat("yyyy-MM", Utils.createCorrectDate(item1.dayList));
  //       if (month == month1) {
  //         for (let item2 of item1.dayList) {
  //           if (item2.currentDate == item.currentDate) {
  //             item2.dayDesc = item.dayDesc;
  //             item2.oriDayDesc = item.dayDesc;
  //             item2.dayClass = item.dayClass;
  //             item2.oriDayClass = item.dayClass;
  //             if (today == item2.currentDate && defaultDay == today) {
  //               item2.dayDesc = "今";
  //               item2.oriDayDesc = item2.dayDesc;
  //               item2.dayClass = "day current";
  //               item2.oriDayClass = "day no-today";
  //             } else if (today == item2.currentDate && defaultDay != today) {
  //               item2.dayDesc = "今";
  //               item2.oriDayDesc = item2.dayDesc;
  //               item2.dayClass = "day no-today";
  //               item2.oriDayClass = "day no-today";
  //             } else if (defaultDay == item2.currentDate) {
  //               let regExp = /[\u4E00-\u9FA5]/g;
  //               if (regExp.test(item2.dayDesc) && item2.dayDesc.length == 2) {
  //                 item2.dayDesc = item2.dayDesc.substring(0, 1);
  //               }
  //               if (!item.dayClass)
  //                 item2.dayClass = "day current";
  //               else {
  //                 item2.dayClass = `day current ${item.dayClass}`;
  //                 item2.oriDayClass = item.dayClass;
  //               }
  //             }

  //             /* if (defaultDay == item2.currentDate) {
  //               if (!item.dayClass)
  //                 item2.dayClass = "day current";
  //               else {
  //                 item2.dayClass = `day current ${item.dayClass}`;
  //                 item2.oriDayClass = item.dayClass;
  //               }
  //             } */
  //             break;
  //           }
  //         }
  //         break;
  //       }
  //     }
  //   }
  // }




  /**
   * 天的swiper对象
   */
  private daySwiper: any;

  /**
   * 日历组件swiper options
   */
  private daySwiperOption: any = {
    loop: false,
    slidesPerView: 1,
    initialSlide: 1,
    observer: true,
    observeParents: true
  }

  /**
   * 用于记录日历月份的数据，判断到底是否应该生成新的日历
   */
  private daySwiperIncludes: Array<string> = new Array<string>();

  //swiper的slide切换记录的索引
  private daySwiperIndex: number = 1;

  //swiper的slide切换的临时日期
  private daySwiperTempDate: string;

  //配置项的copy副本
  private tempOption: Calender.CalenderOptions = new Calender.CalenderOptions();

  /**
   * 日历组件内部使用的可选项对象
   */
  private calenderOption: Calender.CalenderOptions = new Calender.CalenderOptions();

  /**
   * 滑动日历时，月份切换
   */
  private monthDesc: string = "";

  /**
   * 滑动日历组件的日期
   */
  private swiperMonthDate = null;

  /**
   * 多少个月日历模板渲染数据
   */
  private monthCalender: Calender.MonthCalender = new Calender.MonthCalender();

  /**
   * 计算属性，计算option的变化
   * @return {string} 返回空字符串
   */
  get monthCalenderOption(): string {
    if (this.tempOption.beginDate != this.option.beginDate
      || this.tempOption.endDate != this.option.endDate
      || this.tempOption.currentDate != this.option.currentDate) {
      this.tempOption = Object.assign({}, this.option);

      this.calenderOption = Object.assign({}, this.option);
      this.calenderOption.showHeader = this.option.showHeader;
      this.calenderOption.beginDate = Utils.createCorrectDate(this.option.beginDate);
      this.calenderOption.endDate = Utils.createCorrectDate(this.option.endDate);
      this.calenderOption.currentDate = Utils.createCorrectDate(this.option.currentDate);
      this.initialCalender(this.calenderOption);
    }
    return "";
  }

  /**
   * 初始化日历组件
   * @param initCalenderData 初始化组件的需要的数据
   * @return {void} 无返回值
   */
  initialCalender(initCalenderData: any): void {
    //重置原来渲染的所有数据
    this.daySwiperIncludes = new Array<string>();
    //清空原来的日历数据
    this.monthCalender.monthDayList.length = 0;
    this.daySwiperTempDate = "";
    this.daySwiperIndex = 1;
    //重置daySwiper的索引
    if (this.daySwiper) {
      this.daySwiper.activeIndex = 1;
      this.daySwiper.realIndex = 1;
    }
    this.initCalender(initCalenderData);
  }

  /**
   * 初始化日历视图数据 初始化渲染三个月的日历，当前月，上一个月，下一个月
   * @param  {CalenderModule.CalenderOptions} calenderOption 日历初始化选项
   */
  initCalender(calendarOption: Calender.CalenderOptions): void {
    let currentDate: Date = Utils.copyDate(calendarOption.currentDate);
    let currentMonth = currentDate.getMonth();

    //渲染上一个月
    let tempDate: Date = Utils.copyDate(calendarOption.currentDate);
    tempDate.setMonth(currentMonth - 1, 1);
    if (tempDate >= calendarOption.beginDate) {
      this.renderCalenderView(tempDate);
    }
    //渲染当前月
    this.renderCalenderView(currentDate);
    this.monthDesc = Utils.dateFormat("yyyy年M月", currentDate);

    //渲染下一个月
    tempDate = Utils.copyDate(calendarOption.currentDate);
    tempDate.setMonth(currentMonth + 1, 1);
    if (tempDate <= calendarOption.endDate) {
      this.renderCalenderView(tempDate);
    }

    //判断是最小日期还是最大日期，最小日期swiper的activeIndex设置为0，最大日期则为1
    if (this.monthCalender.monthDayList.length == 2 && this.daySwiper) {
      if (this.monthCalender.monthDayList[0].currentMonth == Utils.dateFormat("yyyy-MM-dd", calendarOption.beginDate)) {
        this.daySwiper.activeIndex = 0;
        this.daySwiper.realIndex = 0;
      } else {
        this.daySwiper.activeIndex = 1;
        this.daySwiper.realIndex = 1;
      }
    }
  }

  /**
   * 获取某个事件所在的月份总共有多少天
   * @param {Date} date 日期对象
   * @return {number} 返回获取到的该月总天数
   */
  private getMonthTotalDays(date: Date): number {
    let month: number = date.getMonth();
    let days: number = 0;
    //判断闰年跟平年
    if ((month + 1) == 2 && Utils.isLeapYear(date)) {
      this.monthDays[2] = 29;
    } else {
      this.monthDays[2] = 28;
    }
    days = this.monthDays[month + 1];
    return days;
  }

  /**
   * 渲染日历视图
   * @param {Date} date 日期对象
   * @param {boolean} isRight 是否往右边增加一个月份的日历，true为往右边增加，false为往左边增加，默认为true
   * @param {boolean} isSwiper 是否为滑动渲染的日历
   * @return {void} 无返回值
   */
  private renderCalenderView(date: Date, isRight: boolean = true, isSwiper = false): void {
    let year = date.getFullYear();
    let month: number = date.getMonth();
    let days: number = this.getMonthTotalDays(date);
    let index: number = 0;
    //设置每月第一天时间对象
    let beginDate: Date = new Date(year, month, 1);

    this.daySwiperIncludes.push(Utils.dateFormat("yyyy-MM-dd", beginDate));
    let monthModel: Calender.MonthModel = new Calender.MonthModel();
    //当前月精确到每月的第一天yyyy-MM-01
    monthModel.currentMonth = Utils.dateFormat("yyyy-MM-dd", beginDate);
    //默认日期
    let defaultDay: string = null;
    if (this.calenderOption.currentDate)
      defaultDay = Utils.dateFormat("yyyy-MM-dd", this.calenderOption.currentDate);

    //判断每月第一天是不是周日
    if (beginDate.getDay() == 0) {
      let dayModel: Calender.DayModel = new Calender.DayModel();
      dayModel.currentDate = Utils.dateFormat("yyyy-MM-dd", beginDate);
      dayModel.day = beginDate.getDate();
      dayModel.dayDesc = beginDate.getDate().toString();
      dayModel.oriDayDesc = dayModel.dayDesc;
      dayModel = this.handleCurrentDate(dayModel, monthModel.currentMonth, defaultDay);
      monthModel.dayList.push(dayModel);
      index++;
    } else {
      //把第一天前一直到周末的天数补齐
      let diffDays: number = beginDate.getDay() - 0;
      for (let i = 0; i < diffDays; i++) {
        let dayModel: Calender.DayModel = new Calender.DayModel();
        monthModel.dayList.push(dayModel);
      }
    }
    //循环生成第二天以及以后天数的数据
    for (let i = index + 1; i <= days; i++) {
      let dayModel: Calender.DayModel = new Calender.DayModel();
      let tempDate: Date = Utils.copyDate(beginDate);
      tempDate.setDate(i);
      dayModel.currentDate = Utils.dateFormat("yyyy-MM-dd", tempDate);
      dayModel.day = tempDate.getDate();
      dayModel.dayDesc = tempDate.getDate().toString();
      dayModel.oriDayDesc = dayModel.dayDesc;

      dayModel = this.handleCurrentDate(dayModel, monthModel.currentMonth, defaultDay);

      monthModel.dayList.push(dayModel);
    }
    if (isRight)
      this.monthCalender.monthDayList.push(monthModel);
    else {
      this.monthCalender.monthDayList.unshift(monthModel);
    }
  }

  /**
   * 处理默认选中的日期
   * @param {Calender.DayModel} dayModel 每天信息实体对象
   * @param {string} currentMonth 当前月份，格式yyyy-MM-01
   * @param {string} defaultDay 默认选中的日期
   * @return {Calender.DayModel} 返回每天信息实体对象
   */
  private handleCurrentDate(dayModel: Calender.DayModel, currentMonth: string, defaultDay: string): Calender.DayModel {
    if (this.today == dayModel.currentDate && defaultDay == this.today) {
      dayModel.dayDesc = "今";
      dayModel.oriDayDesc = dayModel.dayDesc;
      dayModel.dayClass = "day current";
      dayModel.oriDayClass = "day no-today";
      this.chooseDayHandle(dayModel, currentMonth, null);
    } else if (this.today == dayModel.currentDate && defaultDay != this.today) {
      dayModel.dayDesc = "今";
      dayModel.oriDayDesc = dayModel.dayDesc;
      dayModel.dayClass = "day no-today";
      dayModel.oriDayClass = "day no-today";
    } else if (defaultDay == dayModel.currentDate) {
      dayModel.dayClass = "day current";
      this.chooseDayHandle(dayModel, currentMonth, null);
    }
    return dayModel;
  }

  /**
   * 注册相关事件，比如swiper相关滑动事件
   * @return {void} 无返回值
   */
  mounted(): void {
    //@ts-ignore
    this.daySwiper = this.$refs.daySwiper.swiper;
    this.registerEvents();
  }

  /**
   * 注册相关事件
   * @return {void} 无返回值
   */
  registerEvents(): void {
    let _this = this;
    //往右边切换天容器，生成slider块
    this.daySwiper.on("slideNextTransitionEnd", function () {
      //获取当前滑动的slide的月份
      let currentMonthDateStr = this.slides.eq(this.activeIndex).attr("data-month");
      //选中的日期
      let chooseDate: Date = null;

      /*****************重置前一个月的状态 并且获取上一个月选中的日期 begin *****************/
      let prevMonthDate = Utils.createCorrectDate(currentMonthDateStr);
      prevMonthDate.setMonth(prevMonthDate.getMonth() - 1, 1);
      let currentMonth = Utils.dateFormat("yyyy-MM-dd", prevMonthDate);
      for (let item of _this.monthCalender.monthDayList) {
        if (item.currentMonth == currentMonth) {
          for (let item1 of item.dayList) {
            if (!item1.dayDesc) continue;
            if (item1.dayClass.indexOf("current") > -1) {//取出选中的一天
              chooseDate = Utils.createCorrectDate(item1.currentDate);
            }
            item1.dayDesc = item1.oriDayDesc;
            item1.dayClass = item1.oriDayClass;
          }
          break;
        }
      }
      /*****************重置前一个月的状态 end *****************/

      /*******************提前渲染下一个月的日历 begin*****************/
      let currentDate: Date = Utils.createCorrectDate(currentMonthDateStr);
      let endDate: Date = <Date>_this.calenderOption.endDate;
      endDate.setDate(1);
      if (currentDate < endDate) {
        currentDate.setMonth(currentDate.getMonth() + 1, 1);
        let dateStr = Utils.dateFormat("yyyy-MM-dd", currentDate);
        if (!_this.daySwiperIncludes.includes(dateStr)) {
          _this.renderCalenderView(currentDate, true, true);
        }
        currentDate = Utils.createCorrectDate(currentMonthDateStr);
        _this.monthDesc = Utils.dateFormat("yyyy年M月", currentDate);
      } else {
        currentDate.setMonth(currentDate.getMonth(), 1);
        _this.monthDesc = Utils.dateFormat("yyyy年M月", currentDate);
      }
      /*******************提前渲染下一个月的日历 end*****************/

      _this.swipeSlideHandle(currentMonthDateStr, true);

      //默认显示上个月选中的那一天
      //(即原来选中的是多少号，现在也显示多少号，假如已经是最后一天了，则默认显示最后一天)
      currentDate = Utils.copyDate(chooseDate);
      //选中日期的月份总天数
      let day1: number = currentDate.getDate();
      //下一个月的时间
      currentDate.setMonth(currentDate.getMonth() + 1, 1);
      //下一个月份的总天数
      let day2: number = _this.getMonthTotalDays(currentDate);
      if (day1 > day2) day1 = day2;
      currentDate.setMonth(currentDate.getMonth(), day1);
      currentMonth = Utils.dateFormat("yyyy-MM", currentDate) + "-01";
      for (let item of _this.monthCalender.monthDayList) {
        if (item.currentMonth == currentMonth) {
          for (let item1 of item.dayList) {
            if (!item1.dayDesc) continue;
            if (item1.currentDate != Utils.dateFormat("yyyy-MM-dd", currentDate)) continue;
            item1.dayClass = "day current";
            _this.chooseDayHandle(item1, item.currentMonth, null);
            break;
          }
          break;
        }
      }
    });
    //往左边切换天容器，生成slider块
    this.daySwiper.on("slidePrevTransitionEnd", function () {
      //获取滑动的slide的当前日期
      let currentMonthDateStr = this.slides.eq(this.activeIndex).attr("data-month");
      //选中的日期
      let chooseDate: Date = null;

      //重置前一个月的状态
      let prevMonthDate = Utils.createCorrectDate(currentMonthDateStr);
      prevMonthDate.setMonth(prevMonthDate.getMonth() + 1);
      let currentMonth = Utils.dateFormat("yyyy-MM-dd", prevMonthDate);
      for (let item of _this.monthCalender.monthDayList) {
        if (item.currentMonth == currentMonth) {
          for (let item1 of item.dayList) {
            if (!item1.dayDesc) continue;
            if (item1.dayClass.indexOf("current") > -1) {//取出选中的一天
              chooseDate = Utils.createCorrectDate(item1.currentDate);
            }
            item1.dayDesc = item1.oriDayDesc;
            item1.dayClass = item1.oriDayClass;
          }
          break;
        }
      }

      /*******************提前渲染上一个月的日历 begin*****************/
      let currentDate: Date = Utils.createCorrectDate(currentMonthDateStr);
      let beginDate: Date = <Date>_this.calenderOption.beginDate;
      beginDate.setDate(1);
      if (currentDate > beginDate) {
        currentDate.setMonth(currentDate.getMonth() - 1, 1);
        let dateStr = Utils.dateFormat("yyyy-MM-dd", currentDate);
        if (!_this.daySwiperIncludes.includes(dateStr)) {
          _this.renderCalenderView(currentDate, false, true);

          this.activeIndex = this.activeIndex + 1;
          this.realIndex = this.realIndex + 1;
        }
        currentDate = Utils.createCorrectDate(currentMonthDateStr);
        _this.monthDesc = Utils.dateFormat("yyyy年M月", currentDate);
      } else {
        currentDate.setMonth(currentDate.getMonth(), 1);
        _this.monthDesc = Utils.dateFormat("yyyy年M月", currentDate);
      }
      /*******************提前渲染上一个月的日历 end*****************/

      _this.swipeSlideHandle(currentMonthDateStr, false);

      //默认每个月第一天为选中状态
      currentDate = Utils.copyDate(chooseDate);
      //选中日期的月份总天数
      let day1: number = currentDate.getDate();
      //下一个月的时间
      currentDate.setMonth(currentDate.getMonth() - 1, 1);
      //下一个月份的总天数
      let day2: number = _this.getMonthTotalDays(currentDate);
      if (day1 > day2) day1 = day2;
      currentDate.setMonth(currentDate.getMonth(), day1);
      currentMonth = Utils.dateFormat("yyyy-MM", currentDate) + "-01";
      for (let item of _this.monthCalender.monthDayList) {
        if (item.currentMonth == currentMonth) {
          for (let item1 of item.dayList) {
            if (item1.currentDate != Utils.dateFormat("yyyy-MM-dd", currentDate)) continue;
            item1.dayClass = "day current";
            _this.chooseDayHandle(item1, item.currentMonth, null);
            break;
          }
          break;
        }
      }
    });
  }

  /**
   * 日历组件滑动的时候通知事件，让组件调用者重置日历状态
   * @param {string} date 日期 yyyy-MM-dd 格式
   * @param {boolean} isNext true表示初始化下下个月日期，false表示初始化上上个月日期
   * @return {void} 无返回值
   */
  @Emit("on-slide")
  swipeSlideHandle(date: string, isNext: boolean = true) {

  }

  /**
   * 选择具体的日期
   * @param {Calender.DayModel} dayItem 当前点击的日期
   * @param {string} month 当前月份，精确到月，如:2017-08
   * @param {string} currentMonth 当前月份，精确到每月第一天：2018-01-01
   * @param {event} event 点击事件
   * @return {any} 可返回任意值
   */
  @Emit("on-click")
  private chooseDayHandle(dayItem: Calender.DayModel, currentMonth: string, event: any = null): any {
    if (!event) return true;
    if (!dayItem.dayDesc && dayItem.dayClass == "day") return true;
    let _this = this;
    for (let item of this.monthCalender.monthDayList) {
      if (item.currentMonth == currentMonth) {//找到当前月
        for (let item1 of item.dayList) {
          if (item1.currentDate != dayItem.currentDate) {
            item1.dayDesc = item1.oriDayDesc;
            item1.dayClass = item1.oriDayClass;
          } else {
            if (_this.today == item1.currentDate) {
              item1.dayClass = "day current";
              item1.dayDesc = "今";
              item1.oriDayDesc = item1.dayDesc;
            } else {
              let regExp = /[\u4E00-\u9FA5]/g;
              if (regExp.test(item1.dayDesc) && item1.dayDesc.length == 2) {
                item1.dayDesc = item1.dayDesc.substring(0, 1);
              }
              item1.dayClass = `day current ${item1.oriDayClass}`;
            }
          }
        }
        break;
      }
    }
  }
}