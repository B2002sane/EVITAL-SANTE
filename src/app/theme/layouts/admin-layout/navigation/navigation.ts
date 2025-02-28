export interface NavigationItem {
  id: string;
  title: string;
  type: 'item' | 'collapse' | 'group';
  translate?: string;
  icon?: string;
  hidden?: boolean;
  url?: string;
  classes?: string;
  groupClasses?: string;
  exactMatch?: boolean;
  external?: boolean;
  target?: boolean;
  breadcrumbs?: boolean;
  children?: NavigationItem[];
  link?: string;
  description?: string;
  path?: string;
}

export const NavigationItems: NavigationItem[] = [
  // {
  //   id: 'dashboard',
  //   title: '',
  //   type: 'group',
  //   icon: 'icon-navigation',
  //   children: [
  //     {
  //       id: 'default',
  //       title: 'Dashboard',
  //       type: 'item',
  //       classes: 'nav-item',
  //       url: '/dashboard/default',
  //       icon: 'dashboard',
  //       breadcrumbs: false
  //     }
  //   ]
  // },
  {
    id: 'authentication',
    title: '',
    type: 'group',
    icon: 'icon-navigation',
    children: [
      {
        id: 'dashboard',
        title: 'Dashboard',
        type: 'item',
        classes: 'nav-item',
        url: '/dashboard/default',
       // icon: 'dashboard',
        target: true,
        breadcrumbs: false
      },
      {
        id: 'register',
        title: 'Personnels Medical',
        type: 'item',
        classes: 'nav-item',
        url: '/register',
       // icon: 'profile',
        target: true,
        breadcrumbs: false
      },
      {
        id: 'register',
        title: 'Patient',
        type: 'item',
        classes: 'nav-item',
        url: '/sample-page',
      //  icon: 'profile',
        target: true,
        breadcrumbs: false
      },
      {
        id: 'register',
        title: 'Gestion Chambres',
        type: 'item',
        classes: 'nav-item',
        url: '/register',
       // icon: 'profile',
        target: true,
        breadcrumbs: false
      },
      {
        id: 'register',
        title: 'Rendez-vous',
        type: 'item',
        classes: 'nav-item',
        url: '/register',
       // icon: 'profile',
        target: true,
        breadcrumbs: false
      },
      {
        id: 'register',
        title: 'Don de Sang',
        type: 'item',
        classes: 'nav-item',
        url: '/register',
       // icon: 'profile',
        target: true,
        breadcrumbs: false
      }
    ]
  },
  // {
  //   id: 'utilities',
  //   title: '',
  //   type: 'group',
  //   icon: 'icon-navigation',
  //   children: [
  //     {
  //       id: 'typography',
  //       title: 'Personnels Medicals',
  //       type: 'item',
  //       classes: 'nav-item',
  //       url: '/typography',
  //       icon: 'font-size'
  //     },
  //     {
  //       id: 'color',
  //       title: 'Patient',
  //       type: 'item',
  //       classes: 'nav-item',
  //       url: '/color',
  //       icon: 'bg-colors'
  //     },
  //   ]
  // },

  // {
  //   id: 'other',
  //   title: '',
  //   type: 'group',
  //   icon: 'icon-navigation',
  //   children: [
  //     {
  //       id: 'sample-page',
  //       title: 'Gestion Chambres',
  //       type: 'item',
  //       url: '/sample-page',
  //       classes: 'nav-item',
  //       icon: 'chrome'
  //     }
  //   ]
  // }
];
