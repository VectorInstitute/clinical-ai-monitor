declare module 'react-plotly.js' {
    import * as Plotly from 'plotly.js';
    import * as React from 'react';

    interface PlotParams {
      data: Plotly.Data[];
      layout?: Partial<Plotly.Layout>;
      config?: Partial<Plotly.Config>;
      frames?: Plotly.Frame[];
      useResizeHandler?: boolean;
      style?: React.CSSProperties;
      className?: string;
      onInitialized?: (figure: Plotly.Figure, graphDiv: HTMLElement) => void;
      onUpdate?: (figure: Plotly.Figure, graphDiv: HTMLElement) => void;
      onPurge?: (figure: Plotly.Figure, graphDiv: HTMLElement) => void;
      onError?: (err: Error) => void;
      onClick?: (event: Plotly.PlotMouseEvent) => void;
      onHover?: (event: Plotly.PlotMouseEvent) => void;
      onUnhover?: (event: Plotly.PlotMouseEvent) => void;
      onSelected?: (event: Plotly.PlotSelectionEvent) => void;
      onRelayout?: (event: Plotly.PlotRelayoutEvent) => void;
      onLegendClick?: (event: Plotly.LegendClickEvent) => boolean;
      onLegendDoubleClick?: (event: Plotly.LegendClickEvent) => boolean;
      onClickAnnotation?: (event: Plotly.ClickAnnotationEvent) => void;
      onAfterPlot?: () => void;
      onAnimated?: () => void;
      onRedraw?: () => void;
    }

    class Plot extends React.Component<PlotParams> {}

    export = Plot;
  }
