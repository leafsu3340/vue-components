## Props

| 名称                 | 类型           | 默认        | 说明                                       
|---------------------|---------------|-------------|------------------------------------------- 
| type                | String        | 'date'      | 选择日期或日期时间(可选：date,datetime)       
| range               | Boolean       | false       | 如果是true， 显示日历范围选择                  
| confirm             | Boolean       | false       | 如果是true， 显示确认按钮且需要确认才更新时间     
| format              | String        | yyyy-MM-dd  | 自定义显示在输入框上的格式(yyyy-MM-dd HH:mm:ss) 
| lang                | String        | zh          | 选择语言 (en/zh/es/pt-br/fr/ru/de/it/cs)     
| placeholder         | String        |             | placeholder的值                              
| width               | String/Number | 210         | 输入框的width                                 
| disabled-days       | Array         | []          | 禁止选择的日期 (['2018-1-1'])                  
| not-before          | String/Date   | ''          | 禁止选择这个时间之前的时间                       
| not-after           | String/Date   | ''          | 禁止选择这个时间之后的时间                       
| shortcuts           | Boolean/Array | true        | 自定义范围选择的时候快捷选项(见下表)               
| time-picker-options | Object        | {}          | 自定义时间选择的开始，结束，步进(见下表)           
| minute-step         | Number        | 0           | 分钟的步进，设置time-picker-options，这项无效    
| first-day-of-week   | Number        | 7           | 设置日历星期几开头(1-7)                         
| input-class         | String        | 'mx-input'  | 自定义输入框的类名                              
| confirm-text        | String        | 'OK'        | 确认按钮的名称                                 

## shortcuts
* true -      显示默认快捷选择
* false -     隐藏快捷选择
* Object[] -  自定义快捷选择, 格式：[{text, start, end}]

| 名称             | 类型          |  说明           |
|-----------------|---------------|----------------|
| text            | String        | 显示文字         |
| start           | Date          | 开始日期         |
| end             | Date          | 结束日期         |

## time-picker-options
* Object[] -  自定义时间选择, 格式：[{start, step, end}]

| 名称             | 类型           |  说明                 |
|-----------------|---------------|-----------------------|
| start           | String        | 开始时间 (eg '00:00')   |
| step            | String        | 步进时间  (eg '00:30')  |
| end             | String        | 结束时间   (eg '23:30') |


## Events
| Name            | 说明                          |  回调参数    |
|-----------------|------------------------------|-------------|
| confirm         | 点击确认按钮触发的事件           | 选择的日期    |
