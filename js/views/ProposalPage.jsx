// import node modules
import React from 'react';
import { Link, withRouter } from 'react-router';
import get from 'lodash.get';
import moment from 'moment';
import sanitizeHtml from 'sanitize-html';

import { deriveProjectId } from '../models/reducers';

class ProposalPage extends React.Component {

	constructor (props) {

		super(props);

	}

	componentWillMount () {

		const { 
			projectInfo,
			proposal
		} = this.getStoreState();

		if (!projectInfo || !Object.keys(projectInfo).length) {
			// only fetch containing project if it's not already in the store
			// TODO: looks like project data exists within `base` property of proposals (pulls) response...
			// 		 may not need this call at all?
			this.props.actions.requestProjectMetadata(this.props.params.owner, this.props.params.projectId);
		}

		if (!proposal) {
			// only fetch proposal if it's not already in the store.
			this.props.actions.requestProposal(this.props.params.owner, this.props.params.projectId, this.props.params.proposalId);
		} else {
			if (!proposal.revisions) {
				this.props.actions.requestProposalRevisions(proposal);
			}
		}

	}

	componentDidUpdate () {

		const { proposal } = this.getStoreState(),
			proposalLoaded = proposal && Object.keys(proposal).length;

		if (proposalLoaded && !proposal.revisions) {
			this.props.actions.requestProposalRevisions(proposal);
		}

	}

	render () {

		const {
			project,
			projectInfo,
			proposal
		} = this.getStoreState();

		let body = sanitizeHtml((get(proposal, 'body') || '').replace(/\n/g, '<br>'));

		console.log(">>>>> project:", projectInfo);
		console.log(">>>>> proposal:", proposal);

		return (
			<div className='page proposal-page'>
				<div className='main'>
					<div className='map'>
					</div>
					<div className='info'>
						<h2 className='title'>{ proposal.title }</h2>
						<Link to='#'>{ get(projectInfo, 'name') || '' }</Link>
						<p className='body' dangerouslySetInnerHTML={{ __html: body }} />
						<div className='created-date'>{ moment(proposal.created_at).format('MMM D YYYY') }</div>
						<div className='footer'>{/* consider making this a functional component, with social share icons, and thumbs up/down as its own component */}</div>
					</div>
					<div className='comments'>
						<h3>Comments</h3>
						<div className='comment-input'>
						</div>
					</div>
				</div>
				<div className='sidebar'>
				</div>
			</div>
		);

	}

	getStoreState () {

		const storeState = this.props.store.getState(),
			project = storeState.projects[deriveProjectId(this.props.params.owner, this.props.params.projectId)],
			projectInfo = get(project, 'data'),
			proposal = get(project, `proposals.data[${ this.props.params.proposalId }]`);

		return {
			project,
			projectInfo,
			proposal
		};

	}

}

export default withRouter(ProposalPage);
