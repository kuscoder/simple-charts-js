export interface IDataAxisX {
    type: 'date';
    values: number[];
}
export interface IDataAxisY {
    name: string;
    color: string;
    values: number[];
}
export interface IChartOptions {
    width: number;
    height: number;
    padding: number;
    rowsCount: number;
    data: {
        xAxis: IDataAxisX | null;
        yAxis: IDataAxisY[];
    };
    i18n: {
        months: string[];
    };
    interactivity: {
        horisontalGuide: boolean;
        guideDotsRadius: number;
        fpsLimit: number;
    };
    style: {
        textFont: string;
        textColor: string;
        secondaryColor: string;
        backgroundColor: string;
    };
    technical: {
        insertMethod: 'append' | 'prepend' | ((containerElement: HTMLElement, chartWrapperElement: HTMLDivElement) => void);
        immediateInit: boolean;
    };
}
