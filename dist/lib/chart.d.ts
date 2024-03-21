import type { IChartOptions } from './types';
export declare class Chart {
    private static presetOptions;
    private readonly WIDTH;
    private readonly HEIGHT;
    private readonly PADDING;
    private readonly ROWS_COUNT;
    private readonly GUIDE_DOTS_RADIUS;
    private readonly DATA;
    private readonly I18N;
    private readonly STYLE;
    private readonly FLAGS;
    private readonly INSERT_METHOD;
    private readonly DPI_WIDTH;
    private readonly DPI_HEIGHT;
    private readonly VIEW_WIDTH;
    private readonly VIEW_HEIGHT;
    private readonly Y_AXIS_DATA_BOUNDARIES;
    private readonly X_RATIO;
    private readonly Y_RATIO;
    private readonly ROWS_STEP;
    private readonly TEXT_STEP;
    private readonly X_AXIS_DATA_COUNT;
    private readonly X_AXIS_DATA_STEP;
    private readonly mouse;
    private isInitialized;
    private rafID;
    private containerElement;
    private wrapperElement;
    private canvasElement;
    private tooltipElement;
    private canvasRect;
    private ctx;
    /**
     * Constructor for creating a new instance of the Chart class.
     *
     * @param {HTMLElement} containerElement - the HTML element that will contain the chart
     * @param {Partial<IChartOptions>} options - optional chart options
     */
    constructor(containerElement: HTMLElement, options?: Partial<IChartOptions>);
    /** Create the necessary DOM elements for the chart, but does not insert into the DOM. */
    private createDOMElements;
    /** Initializes the component by appending the canvas to the container element and drawing the chart. */
    initialize(): void;
    /** Destroys the component from the DOM. */
    destroy(): void;
    /** Main method that draws the chart by clearing the canvas. */
    private drawChart;
    /** Draws the background of the chart. */
    private drawBackground;
    /** Draws the X axis of the chart and guide lines. */
    private drawAxisX;
    /**
     * Draws the guide lines if the mouse-x is over the y-axis data item.
     *
     * @param {number} x - The x-coordinate to check for mouse position and draw the guide lines.
     * @return {boolean} true if the guide lines were drawn, false otherwise
     */
    private drawGuideLinesIsOver;
    /** Draws the Y axis of the chart. */
    private drawAxisY;
    /** Draws the lines of the chart. */
    private drawLines;
    /** Event handler that updates the mouse position by canvas coordinates. */
    private mouseMoveHandler;
    /** Event handler that resets the mouse position when the mouse leaves the canvas. */
    private mouseLeaveHandler;
    /** Event handler that update the chart interactivity when the window is resized. */
    private resizeHandler;
    /**
     * Generates boundaries for the y-axis based on the provided columns.
     *
     * @param {IDataAxisY[]} columns - an array of data axis Y values
     * @return {[number, number]} an array containing the minimum and maximum y values
     */
    private getYAxisDataBoundaries;
    /**
     * Returns a formatted date string for x-axis based on the given timestamp.
     *
     * @param {number} timestamp - The timestamp to convert to a date.
     * @return {string} The formatted date string in the format "day month".
     */
    private getDate;
    /**
     * Converts x coordinate from x-axis data to canvas coordinate.
     *
     * @param {number} x - x coordinate in x-axis data
     * @return {number} x coordinate in canvas
     */
    private getX;
    /**
     * Converts x coordinate from y-axis data to canvas coordinate.
     *
     * @param {number} y - y coordinate in y-axis data
     * @return {number} y coordinate in canvas
     */
    private getY;
    /**
     * Calculate the maximum length of the Y-axis data.
     *
     * @param {?IDataAxisY[]} yAxisData - optional parameter for the Y-axis data
     * @return {number} the maximum length of the Y-axis data.
     */
    private getAxisYDataLength;
    /**
     * Checks if the mouse-x is hovering over an x-axis data item at its x-coordinate.
     *
     * @param {number} x - The x-axis data item coordinate to check.
     * @return {boolean} true if the mouse-x is hovering over the x-axis data item, false otherwise.
     */
    private isMouseOverYAxisDataItem;
    /**
     * Validates the provided options for a chart constructor.
     *
     * @param {Partial<IChartOptions>} options - the options to be validated
     * @throws {ChartOptionsError} if the options are invalid
     * @return {void}
     */
    private static validateOptions;
    /**
     * Returns the formatted options for the chart constructor by merging the provided options with the preset options.
     *
     * @param {Partial<IChartOptions>} options - The options to merge with the preset options.
     * @return {IChartOptions} The merged options.
     */
    private static getOptions;
    /**
     * Updates the preset options with the provided options.
     *
     * @param {Partial<IChartOptions>} options - The options to update the preset options with. Default is an empty object.
     */
    static changePresetOptions(options?: Partial<IChartOptions>): void;
}
