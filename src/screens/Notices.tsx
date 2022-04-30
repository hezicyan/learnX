import {useCallback, useEffect} from 'react';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {StackActions} from '@react-navigation/native';
import NoticeCard from 'components/NoticeCard';
import FilterList from 'components/FilterList';
import SafeArea from 'components/SafeArea';
import {getAllNoticesForCourses} from 'data/actions/notices';
import {useAppDispatch, useAppSelector} from 'data/store';
import {Notice} from 'data/types/state';
import useFilteredData from 'hooks/useFilteredData';
import useDetailNavigator from 'hooks/useDetailNavigator';
import {ScreenParams} from './types';

const Notices: React.FC<
  React.PropsWithChildren<NativeStackScreenProps<ScreenParams, 'Notices'>>
> = ({navigation}) => {
  const detailNavigator = useDetailNavigator();

  const dispatch = useAppDispatch();
  const loggedIn = useAppSelector(state => state.auth.loggedIn);
  const courseIds = useAppSelector(
    state => state.courses.items.map(i => i.id),
    (a, b) => JSON.stringify(a) === JSON.stringify(b),
  );
  const hiddenCourseIds = useAppSelector(state => state.courses.hidden);
  const noticeState = useAppSelector(state => state.notices);
  const fetching = useAppSelector(state => state.notices.fetching);

  const [all, unread, fav, archived, hidden] = useFilteredData(
    noticeState.items,
    noticeState.unread,
    noticeState.favorites,
    noticeState.archived,
    noticeState.pinned,
    hiddenCourseIds,
  );

  const handleRefresh = useCallback(() => {
    if (loggedIn && courseIds.length !== 0) {
      dispatch(getAllNoticesForCourses(courseIds));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(courseIds), dispatch, loggedIn]);

  const handlePush = (item: Notice) => {
    if (detailNavigator) {
      detailNavigator.dispatch(
        StackActions.replace('NoticeDetail', {
          ...item,
          disableAnimation: true,
        }),
      );
    } else {
      navigation.push('NoticeDetail', item);
    }
  };

  useEffect(() => {
    handleRefresh();
  }, [handleRefresh]);

  return (
    <SafeArea>
      <FilterList
        type="notice"
        all={all}
        unread={unread}
        fav={fav}
        archived={archived}
        hidden={hidden}
        itemComponent={NoticeCard}
        navigation={navigation}
        onItemPress={handlePush}
        refreshing={fetching}
        onRefresh={handleRefresh}
      />
    </SafeArea>
  );
};

export default Notices;
