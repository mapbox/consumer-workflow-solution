import React from "react";

interface Props {
  name: string;
  duration: number;
  focused?: boolean;
}

export class DestinationSidebarView extends React.PureComponent<Props & React.HTMLAttributes<HTMLDivElement>> {
  render() {
    const { name, focused, duration, ...props } = this.props;
    const days: string = (duration === 1 ? "day" : "days")
    const classes = focused ? "stop-sidebar focus" : "stop-sidebar";
    return (
      <h2 className={classes} {...props}>
        {name}: {duration} {days}
      </h2>
    );
  }
}
