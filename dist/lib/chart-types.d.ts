export interface ILine {
    key: string;
    name: string;
    color: string;
    vertices: number[];
}
export interface IChartOptions {
    width: number;
    height: number;
    padding: number;
    rowsCount: number;
    data: {
        timeline: {
            type: 'date';
            values: number[];
        };
        lines: ILine[];
    };
    i18n: {
        months: string[];
    };
    interactivity: {
        tooltipPosition: TooltipPositions;
        horisontalGuide: boolean;
        guideDotsRadius: number;
        fpsLimit: number;
        disable: boolean;
    };
    style: {
        textFont: string;
        textColor: string;
        secondaryColor: string;
        backgroundColor: string;
        classNames: {
            wrapper: string;
            canvas: string;
            tooltip: string;
        };
    };
    technical: {
        debug: boolean;
        insertMethod: InsertMethod;
        immediateInit: boolean;
    };
}
export type TooltipPositions = 'top' | 'left' | 'bottom' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
export type InsertMethod = 'append' | 'prepend' | ((containerElement: HTMLElement, chartWrapperElement: HTMLDivElement) => void);
export interface IMouseProxy {
    value: {
        mouseX: number | null;
        mouseY: number | null;
        tooltipLeft: number | null;
        tooltipTop: number | null;
    };
}
export interface ITooltipItem {
    name: string;
    color: string;
    value: number;
}
export type DeepPartial<T> = T extends unknown[] ? T : T extends Function ? T : T extends Record<string, any> ? {
    [P in keyof T]?: DeepPartial<T[P]>;
} : T;
