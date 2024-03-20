export interface ISimpleGraphsJSColumn {
    type: string;
    name: string;
    color: string;
    values: [number, number][];
}
export interface ISimpleGraphsJSOptionsColumn extends Omit<ISimpleGraphsJSColumn, 'values'> {
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
        dates: number[];
        columns: ISimpleGraphsJSOptionsColumn[];
    };
    style: {
        textFont: string;
        textColor: string;
        secondaryColor: string;
    };
    immediate: boolean;
}
