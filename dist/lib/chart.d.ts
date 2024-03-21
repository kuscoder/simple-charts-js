import type { IChartOptions } from './types';
export declare class Chart {
    private static presetOptions;
    private readonly WIDTH;
    private readonly HEIGHT;
    private readonly PADDING;
    private readonly ROWS_COUNT;
    private readonly MONTHS_NAMES;
    private readonly DATA;
    private readonly STYLES;
    private readonly DPI_WIDTH;
    private readonly DPI_HEIGHT;
    private readonly VIEW_WIDTH;
    private readonly VIEW_HEIGHT;
    private readonly Y_BOUNDARIES;
    private readonly X_RATIO;
    private readonly Y_RATIO;
    private readonly ROWS_STEP;
    private readonly TEXT_STEP;
    private readonly X_AXIS_DATA_COUNT;
    private readonly X_AXIS_DATA_STEP;
    private isInitialized;
    private rafID;
    private readonly mouse;
    private readonly container;
    private readonly canvas;
    private readonly ctx;
    private canvasRect;
    /** */
    constructor(container: HTMLElement, options?: Partial<IChartOptions>);
    /** Initializes the component by appending the canvas to the container element and drawing the chart */
    initialize(): void;
    /** Destroys the component from the DOM */
    destroy(): void;
    /** */
    private drawGraph;
    /** */
    private clearAll;
    /** */
    private drawAxisX;
    private drawGuides;
    /** */
    private drawAxisY;
    /** */
    private drawLines;
    /** */
    private mouseMoveHandler;
    /** */
    private mouseLeaveHandler;
    /** */
    private getBoundariesY;
    /** */
    private getDate;
    /** */
    private getX;
    /** */
    private getY;
    /** */
    private static validateOptions;
    /** */
    private static getOptions;
    /**
     * Updates the preset options with the provided options.
     *
     * @param {Partial<IChartOptions>} options - The options to update the preset options with. Default is an empty object.
     */
    static changePresetOptions(options?: Partial<IChartOptions>): void;
}
