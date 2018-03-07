 import React from 'react'
// import { 
// 	Button, 
// 	Panel, 
// 	Glyphicon,
// 	ListGroup,
// 	ListGroupItem,
// 	Row,
// 	Col,
// 	Card,
// 	CardHeader,
// 	CardBody
// } from 'reactstrap'

import {
	Button,
	Card,
	Grid,
	Segment,
	List,
	Header,
	Divider
} from 'semantic-ui-react'

import { Link } from 'react-router-dom'

import ScopeComment from '../../common/scope_comment/ScopeComment.jsx'
import HostsEntryLinePorts from './HostsEntryLinePorts.jsx'

class HostsEntryLine extends React.Component {

	constructor(props) {
		super(props);
	}

	render() {
		const { host } = this.props;
		const verbose_host_link = '/project/' + this.props.project_uuid + '/host/' + host.hostname;

		const footer = (
			<div>
	            <a onClick={() => window.open(verbose_host_link, Math.random().toString(36).substring(7), 'width=850,height=700')}>
					<Button basic size="tiny">
						Verbose
					</Button>
	            </a>

				<Button basic color="red" size="tiny" onClick={this.props.deleteScope}>
					Delete
				</Button>
			</div>
		);

		let files_by_statuses = {
			'2xx': [],
			'3xx': [],
			'4xx': [],
			'5xx': []
		}

		for (var file of host.files) {
			if (Math.floor(file.status_code / 100) === 3) {
				files_by_statuses['3xx'].push(file);
			}
			else if (Math.floor(file.status_code / 100) === 4) {
				files_by_statuses['4xx'].push(file);
			}
			else if (Math.floor(file.status_code / 100) === 5) {
				files_by_statuses['5xx'].push(file);
			}
			else if (Math.floor(file.status_code / 100) === 2) {
				files_by_statuses['2xx'].push(file);
			}
		}

		const description = (
			<div>
				<Header>{host.hostname}</Header>
				<Divider />
				<ScopeComment comment={host.comment}
							  onCommentSubmit={this.props.onCommentSubmit} />

				<Divider hidden />
				<List bulleted>
					<List.Item>2xx: <strong>{files_by_statuses['2xx'].length}</strong></List.Item> 
					<List.Item>3xx: {files_by_statuses['3xx'].length}</List.Item>
					<List.Item>4xx: {files_by_statuses['4xx'].length}</List.Item>
					<List.Item>5xx: {files_by_statuses['5xx'].length}</List.Item>
				</List>

				<HostsEntryLinePorts host={host} />
			</div>
		);

		return (
			<Card color="blue" fluid>
				<Card.Content description={description} />
				<Card.Content extra>{footer}</Card.Content>
			</Card>			
		)
	}
}

export default HostsEntryLine;
