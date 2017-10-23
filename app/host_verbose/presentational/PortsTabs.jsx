import _ from 'lodash'
import React from 'react'
import { Tab, Table } from 'semantic-ui-react'


class PortsTabs extends React.Component {
	constructor(props) {
		super(props);
	}

	componentWillMount() {
		this.props.tabChange(0);
	}

	render() {
		var i = 0;

		var panes = [];

		for (var port of this.props.ports) {
			var filtered_files = _.filter(this.props.files, (y) => {
				return port.port_number == y.port_number;
			});

			filtered_files = filtered_files.sort((a, b) => {
				if (a.status_code > b.status_code) return 1;
				if (a.status_code < b.status_code) return -1;
				return 0;
			});

			var files = _.map(filtered_files, (port) => {
				var result = Math.floor(port.status_code / 100)
				if (result == 2) {
					return <Table.Row key={port.file_id}>
								<Table.Cell style={{'color': '#22CF22'}}>{port.status_code}</Table.Cell>
								<Table.Cell>{port.content_length}</Table.Cell>
								<Table.Cell><a href={port.file_path} target="_blank">{port.file_name}</a></Table.Cell>
								<Table.Cell></Table.Cell>
						   </Table.Row>
				}
				else {
					return <Table.Row key={port.file_id}>
								<Table.Cell>{port.status_code}</Table.Cell>
								<Table.Cell>{port.content_length}</Table.Cell>
								<Table.Cell><a href={port.file_path} target="_blank">{port.file_name}</a></Table.Cell>
								<Table.Cell>{port.special_note &&port.special_note}</Table.Cell>
						   </Table.Row>
				}
			});

			panes.push({
				menuItem: String(port.port_number),
				render: () => (
					<Tab.Pane>
						<Table>
							<Table.Body>
								{files}
							</Table.Body>
						</Table>
					</Tab.Pane>
				)
			});		
		}

		return (
			<Tab panes={panes} />
		)
	}
}

export default PortsTabs;
