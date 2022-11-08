import React, { ReactNode, useMemo } from 'react';
import { useRouter } from 'next/router';
import { signOut, useSession } from 'next-auth/react';

import LoadingPage from 'components/loadings/LoadingPage';
import { Sidebar } from 'components/Sidebar';
import { REFRESH_TOKEN_ERROR } from 'utils/constants';
import { BOARDS_ROUTE, DASHBOARD_ROUTE, TEAMS_ROUTE } from 'utils/routes';
import DashboardLayout from '../DashboardLayout';
import { Container } from './styles';

const Layout: React.FC<{ children: ReactNode, canAddBoard?: boolean }> = ({ children, canAddBoard }) => {
	const { data: session } = useSession({ required: true });

	const router = useRouter();

	const isDashboard = router.pathname === DASHBOARD_ROUTE;
	const isBoards = router.pathname === BOARDS_ROUTE;
	const isTeams = router.pathname === TEAMS_ROUTE;

	if (session?.error === REFRESH_TOKEN_ERROR) {
		signOut({ callbackUrl: '/' });
	}

	const renderMain = useMemo(() => {
		if (!session) return null;
		return (
			<DashboardLayout
				firstName={session.user.firstName}
				isBoards={isBoards}
				isDashboard={isDashboard}
				isTeams={isTeams}
				canAddBoard
			>
				{children}
			</DashboardLayout>
		);
	}, [children, isBoards, isDashboard, session, isTeams]);

	if (!session) return <LoadingPage />;

	return (
		<>
			<Container>
				<Sidebar
					email={session.user.email}
					firstName={session.user.firstName}
					lastName={session.user.lastName}
					strategy={session.strategy}
				/>
				{renderMain}
			</Container>
			{!session && <LoadingPage />}
		</>
	);
};

export default Layout;
