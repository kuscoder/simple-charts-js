export interface ISimpleGraphsJSAxisX {
    type: 'date';
    values: number[];
}
export interface ISimpleGraphsJSAxisY {
    name: string;
    color: string;
    values: number[];
}
export interface ISimpleGraphsJSOptions {
    width: number;
    height: number;
    padding: number;
    rowsCount: number;
    i18n: {
        months: string[];
    };
    data: {
        xAxis: ISimpleGraphsJSAxisX | null;
        yAxis: ISimpleGraphsJSAxisY[];
    };
    style: {
        textFont: string;
        textColor: string;
        secondaryColor: string;
    };
    immediate: boolean;
}
