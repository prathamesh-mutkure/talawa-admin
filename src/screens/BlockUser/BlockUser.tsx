import React, { useEffect, useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import { useMutation, useQuery } from '@apollo/client';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';

import styles from './BlockUser.module.css';
import { BLOCKED_USERS_LIST } from 'GraphQl/Queries/Queries';
import AdminNavbar from 'components/AdminNavbar/AdminNavbar';
import { RootState } from 'state/reducers';
import {
  BLOCK_USER_MUTATION,
  UNBLOCK_USER_MUTATION,
} from 'GraphQl/Mutations/mutations';
import { useTranslation } from 'react-i18next';
import PaginationList from 'components/PaginationList/PaginationList';
import { errorHandler } from 'utils/errorHandler';
import debounce from 'utils/debounce';

interface Member {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  organizationsBlockedBy: {
    _id: string;
    __typename: 'Organization';
  }[];
  __typename: 'User';
}

const Requests = () => {
  const { t } = useTranslation('translation', {
    keyPrefix: 'blockUnblockUser',
  });

  document.title = t('title');

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  const currentUrl = window.location.href.split('=')[1];

  const appRoutes = useSelector((state: RootState) => state.appRoutes);
  const { targets, configUrl } = appRoutes;

  const [membersData, setMembersData] = useState<Member[]>([]);
  const [state, setState] = useState(0);
  const [filterData, setFilterData] = useState({
    member_of: currentUrl,
    firstName_contains: '',
    lastName_contains: '',
  });

  const {
    data,
    loading,
    error,
    refetch: memberRefetch,
  } = useQuery(BLOCKED_USERS_LIST, {
    variables: {
      member_of: currentUrl,
      firstName_contains: '',
      lastName_containe: '',
    },
  });

  const [blockUser] = useMutation(BLOCK_USER_MUTATION);
  const [unBlockUser] = useMutation(UNBLOCK_USER_MUTATION);

  useEffect(() => {
    if (!data) {
      return;
    }

    if (state === 0) {
      setMembersData(data.users);
    } else {
      const blockUsers = data.users.filter((user: Member) =>
        user.organizationsBlockedBy.some((org) => org._id === currentUrl)
      );

      setMembersData(blockUsers);
    }
  }, [state, data]);

  if (loading) {
    return <div className="loader"></div>;
  }

  const handleChangePage = (
    event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number
  ) => {
    setPage(newPage);
  };

  /* istanbul ignore next */
  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearch = (filters: typeof filterData) => {
    memberRefetch(filters);
  };

  const handleSearchDebounced = debounce(handleSearch);

  const updateFilters = (
    name: 'firstName_contains' | 'lastName_contains',
    value: string
  ) => {
    const newFilterData = {
      ...filterData,
      [name]: value,
    };

    setFilterData(newFilterData);
    handleSearchDebounced(newFilterData);
  };

  const handleBlockUser = async (userId: string) => {
    try {
      const { data } = await blockUser({
        variables: {
          userId,
          orgId: currentUrl,
        },
      });
      /* istanbul ignore next */
      if (data) {
        toast.success(t('blockedSuccessfully'));
        memberRefetch();
      }
    } catch (error: any) {
      /* istanbul ignore next */
      errorHandler(t, error);
    }
  };

  const handleUnBlockUser = async (userId: string) => {
    try {
      const { data } = await unBlockUser({
        variables: {
          userId,
          orgId: currentUrl,
        },
      });
      /* istanbul ignore next */
      if (data) {
        toast.success(t('Un-BlockedSuccessfully'));
        memberRefetch();
      }
    } catch (error: any) {
      /* istanbul ignore next */
      errorHandler(t, error);
    }
  };

  /* istanbul ignore next */
  if (error) {
    window.location.replace('/orglist');
  }

  return (
    <>
      <AdminNavbar targets={targets} url_1={configUrl} />
      <Row>
        <Col sm={3}>
          <div className={styles.sidebar}>
            <div className={styles.sidebarsticky}>
              <h6 className={styles.searchtitle}>{t('searchByName')}</h6>
              <input
                type="name"
                id="firstName"
                placeholder={t('searchFirstName')}
                name="firstName_contains"
                value={filterData.firstName_contains}
                data-testid="searchByFirstName"
                autoComplete="off"
                required
                onChange={(e) => {
                  updateFilters('firstName_contains', e.target.value);
                }}
              />

              <input
                type="name"
                id="lastName"
                placeholder={t('searchLastName')}
                name="lastName_contains"
                value={filterData.lastName_contains}
                data-testid="searchByLastName"
                autoComplete="off"
                required
                onChange={(e) => {
                  updateFilters('lastName_contains', e.target.value);
                }}
              />

              <div className={styles.radio_buttons} data-testid="usertypelist">
                <input
                  id="allusers"
                  value="allusers"
                  name="displaylist"
                  type="radio"
                  data-testid="allusers"
                  defaultChecked={state == 0}
                  onClick={() => {
                    setState(0);
                  }}
                />
                <label htmlFor="userslist">{t('allUsers')}</label>
                <input
                  id="blockedusers"
                  value="blockedusers"
                  name="displaylist"
                  data-testid="blockedusers"
                  type="radio"
                  defaultChecked={state == 1}
                  onClick={() => {
                    setState(1);
                  }}
                />

                <label htmlFor="adminslist">{t('blockedUsers')}</label>
              </div>
            </div>
          </div>
        </Col>

        <Col sm={8}>
          <div className={styles.mainpageright}>
            <Row className={styles.justifysp}>
              <p className={styles.logintitle}>{t('listOfUsers')}</p>
            </Row>
            <div className={styles.list_box}>
              <div className="table-responsive">
                <table className={`table table-hover ${styles.userListTable}`}>
                  <thead>
                    <tr>
                      <th scope="col">#</th>
                      <th scope="col">{t('name')}</th>
                      <th scope="col">{t('email')}</th>
                      <th scope="col" className="text-center">
                        {t('block_unblock')}
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {(rowsPerPage > 0
                      ? membersData.slice(
                          page * rowsPerPage,
                          page * rowsPerPage + rowsPerPage
                        )
                      : membersData
                    ).map((user, index: number) => {
                      return (
                        <tr key={user._id}>
                          <th scope="row">{page * 10 + (index + 1)}</th>
                          <td>{`${user.firstName} ${user.lastName}`}</td>
                          <td>{user.email}</td>
                          <td className="text-center">
                            {user.organizationsBlockedBy.some(
                              (spam: any) => spam._id === currentUrl
                            ) ? (
                              <button
                                className="btn btn-danger"
                                onClick={() => handleUnBlockUser(user._id)}
                                data-testid={`unBlockUser${user._id}`}
                              >
                                {t('unblock')}
                              </button>
                            ) : (
                              <button
                                className="btn btn-success"
                                onClick={() => handleBlockUser(user._id)}
                                data-testid={`blockUser${user._id}`}
                              >
                                {t('block')}
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
            <div>
              <table
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <tbody>
                  <tr>
                    <PaginationList
                      count={membersData.length}
                      rowsPerPage={rowsPerPage}
                      page={page}
                      onPageChange={handleChangePage}
                      onRowsPerPageChange={handleChangeRowsPerPage}
                    />
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </Col>
      </Row>
    </>
  );
};

export default Requests;
