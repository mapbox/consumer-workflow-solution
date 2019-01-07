import React from "react";

interface Props {
  name: string;
  focused?: boolean;
}

export class DestinationSidebarView extends React.PureComponent<Props & React.HTMLAttributes<HTMLDivElement>> {
  render() {
    const { name, focused, ...props } = this.props;
    const classes = focused ? "stop-sidebar focus" : "stop-sidebar";
    return (
      <h2 className={classes} {...props}>
        {name}
      </h2>
    );
  }
}
