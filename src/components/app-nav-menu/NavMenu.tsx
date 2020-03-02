import accessibleStyles from '@patternfly/react-styles/css/utilities/Accessibility/accessibility';
import '@patternfly/react-core/dist/styles/base.css';
import * as React from 'react';
import {Link} from 'react-router-dom';
import * as Gravatar from 'react-gravatar';
import {css} from '@patternfly/react-styles';
import {
    Brand,
    Dropdown,
    DropdownItem,
    DropdownToggle,
    Nav,
    NavGroup,
    NavItem,
    NavList,
    Page,
    PageHeader,
    PageSidebar,
    Toolbar,
    ToolbarGroup,
    ToolbarItem
} from '@patternfly/react-core';
import {container} from '../../inversify.config';
import './nav-menu.styl';
import {Keycloak} from "../../services/keycloak/Keycloak";

const DARK = 'dark';
const WHITE = 'white';

type INavItem = { to: string, label?: string, ico?: string };

/**
 * This class prepares the main dashboard page with nav menu.
 * @author Oleksii Orel
 */
export class NavMenu extends React.PureComponent<any, any> {
    private readonly onDropdownToggle: (isOpen: boolean) => void;
    private readonly onDropdownSelect: (event: any) => void;
    private readonly onNavSelect: (item: any) => void;
    private readonly onNavToggle: () => void;
    private readonly onTheme: (item: string) => void;
    private readonly onLogout: () => void;

    constructor(props: any) {
        super(props);

        const currentTheme = window.sessionStorage.getItem('theme');
        const theme = currentTheme ? currentTheme : DARK;
        this.state = {isDropdownOpen: false, activeItem: '', isNavOpen: true, theme};

        const keycloak = container.get(Keycloak);

        this.onTheme = (theme: string) => {
            this.setState({theme});
            window.sessionStorage.setItem('theme', theme);
        };
        this.onLogout = () => {
            keycloak.logout();
        };
        this.onDropdownToggle = (isDropdownOpen: any) => {
            this.setState({isDropdownOpen})
        };
        this.onDropdownSelect = () => {
            this.setState({isDropdownOpen: !this.state.isDropdownOpen});
        };
        this.onNavSelect = (result: any) => {
            this.setState({activeItem: result.itemId});
        };
        this.onNavToggle = () => {
            this.setState({isNavOpen: !this.state.isNavOpen});
        };

        //TODO add implementation of adding and removing this event listener depends on rendering
        window.addEventListener('message', event => {
            if (!event || !window.location.hash.startsWith('#/ide/')) {
                return;
            }
            if (event.data === 'show-navbar') {
                this.setState({isNavOpen: true});
            } else if (event.data === 'hide-navbar') {
                this.setState({isNavOpen: false});
            }
        }, false);
        // window.removeEventListener()
    }

    render() {
        const {isDropdownOpen, activeItem, isNavOpen, creationLink, theme} = this.state;
        // create a Sidebar
        const PageNav = (
            <Nav onSelect={this.onNavSelect} aria-label='Nav' theme={theme}>
                <NavList>
                    {this.props.items.filter((item: INavItem) => !!item.label).map((item: INavItem, index: number) => (
                        <NavItem key={`nav_bar_item_${index + 1}`} itemId={item.to} isActive={activeItem === item.to}>
                            <Link to={item.to}><i className={item.ico}>&nbsp;&nbsp;</i>{item.label}</Link>
                        </NavItem>
                    ))}
                    <NavGroup title='RECENT WORKSPACES'>
                        <NavItem><Link to={'/create-workspace'}><i className='fa fa-plus'>&nbsp;&nbsp;</i>
                            Create Workspace
                        </Link></NavItem>
                        {this.props.workspaces.map((workspace: any, index: number) =>
                            <NavItem key={`nav_bar_sub_item_${index + 1}`} itemId={`wrksp_${index + 1}`}
                                     isActive={activeItem === `wrksp_${index + 1}`}>
                                <Link to={`/ide/${workspace.namespace}/${workspace.devfile.metadata.name}`}>
                                    <i className={workspace.status === 'RUNNING' ? 'fa fa-circle' : 'fa fa-circle-o'}>
                                        &nbsp;&nbsp;
                                    </i>
                                    {workspace.namespace}/{workspace.devfile.metadata.name}
                                </Link>
                            </NavItem>
                        )}
                    </NavGroup>
                </NavList>
            </Nav>
        );
        const Sidebar = <PageSidebar nav={PageNav} isNavOpen={isNavOpen} theme={theme}/>;
        const UserDropdownItems = [
            <DropdownItem key='white' onClick={() => this.onTheme(WHITE)} component='button'>White theme</DropdownItem>,
            <DropdownItem key='dark' onClick={() => this.onTheme(DARK)} component='button'>Dadark theme</DropdownItem>,
            <DropdownItem key='account_details'>Account details</DropdownItem>,
            <DropdownItem key='account_logout' onClick={this.onLogout} component='button'>Logout</DropdownItem>
        ];
        const getUserName = () => {
            const user = this.props.user;
            if (user.given_name && user.family_name) {
                return `${user.given_name} ${user.family_name}`;
            }
            return user.name;
        };
        const UserDropdownToggle = (<DropdownToggle onToggle={this.onDropdownToggle}>{getUserName()}</DropdownToggle>);
        const PageToolbar = (
            <Toolbar>
                <ToolbarGroup>
                    <ToolbarItem className={css(accessibleStyles.screenReader, accessibleStyles.visibleOnMd)}>
                        <Dropdown toggle={UserDropdownToggle} isOpen={isDropdownOpen} isPlain position='right'
                                  dropdownItems={UserDropdownItems} onSelect={this.onDropdownSelect}/>
                    </ToolbarItem>
                </ToolbarGroup>
            </Toolbar>
        );
        const Avatar = <Gravatar email={(this.props.user ? this.props.user.email : '')} className='pf-c-avatar'/>;
        const Logo = <Brand src={`./${this.props.logoURL}`} alt=''/>;
        const Header = (
            <PageHeader
                className={isNavOpen ? 'nav-show' : 'nav-hide'}
                logo={Logo}
                logoProps={{href: 'https://www.eclipse.org/che/', target: '_blank'}}
                toolbar={PageToolbar}
                avatar={Avatar}
                isNavOpen={isNavOpen}
                onNavToggle={this.onNavToggle}
            />
        );

        return (<Page header={Header} sidebar={Sidebar}> {this.props.children} </Page>);
    }
}