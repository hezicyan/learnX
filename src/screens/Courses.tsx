import {useCallback, useEffect, useMemo} from 'react';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {StackActions} from '@react-navigation/native';
import dayjs from 'dayjs';
import CourseCard from 'components/CourseCard';
import FilterList from 'components/FilterList';
import SafeArea from 'components/SafeArea';
import {useAppDispatch, useAppSelector} from 'data/store';
import {getCoursesForSemester} from 'data/actions/courses';
import {Course} from 'data/types/state';
import useDetailNavigator from 'hooks/useDetailNavigator';
import {getSemesterTextFromId} from 'helpers/parse';
import {uploadCourses} from 'helpers/coursex';
import {CourseStackParams} from './types';

type Props = NativeStackScreenProps<CourseStackParams, 'Courses'>;

const Courses: React.FC<Props> = ({navigation}) => {
  const detailNavigator = useDetailNavigator();

  const dispatch = useAppDispatch();
  const loggedIn = useAppSelector(state => state.auth.loggedIn);
  const currentSemesterId = useAppSelector(state => state.semesters.current);
  const courseInformationSharing = useAppSelector(
    state => state.settings.courseInformationSharing,
  );
  const courses = useAppSelector(state => state.courses.items);
  const coursesWithoutOrder = useAppSelector(
    state => state.courses.items,
    (a, b) =>
      JSON.stringify(a.map(a => a.id).sort()) ===
      JSON.stringify(b.map(b => b.id).sort()),
  );
  const hiddenIds = useAppSelector(state => state.courses.hidden);
  const fetching = useAppSelector(state => state.courses.fetching);

  const notices = useAppSelector(state => state.notices.items);
  const assignments = useAppSelector(state => state.assignments.items);
  const files = useAppSelector(state => state.files.items);

  const coursesWithCounts = useMemo(() => {
    return courses.map(course => ({
      ...course,
      unreadNoticeCount: notices.filter(
        notice => notice.courseId === course.id && !notice.hasRead,
      ).length,
      unfinishedAssignmentCount: assignments.filter(
        assignment =>
          assignment.courseId === course.id &&
          !assignment.submitted &&
          dayjs(assignment.deadline).isAfter(dayjs()),
      ).length,
      unreadFileCount: files.filter(
        file => file.courseId === course.id && file.isNew,
      ).length,
    }));
  }, [assignments, courses, files, notices]);

  const all = coursesWithCounts.filter(i => !hiddenIds.includes(i.id));
  const hidden = coursesWithCounts.filter(i => hiddenIds.includes(i.id));

  const handleRefresh = useCallback(() => {
    if (loggedIn && currentSemesterId) {
      dispatch(getCoursesForSemester(currentSemesterId));
    }
  }, [currentSemesterId, dispatch, loggedIn]);

  const handlePush = (item: Course) => {
    if (detailNavigator) {
      detailNavigator.dispatch(
        StackActions.replace('CourseDetail', {
          ...item,
          disableAnimation: true,
        }),
      );
    } else {
      navigation.push('CourseDetail', item);
    }
  };

  useEffect(() => {
    handleRefresh();
  }, [handleRefresh]);

  useEffect(() => {
    if (courseInformationSharing) {
      (async () => {
        try {
          await uploadCourses(coursesWithoutOrder);
        } catch {}
      })();
    }
  }, [courseInformationSharing, coursesWithoutOrder]);

  return (
    <SafeArea>
      <FilterList
        type="course"
        defaultSubtitle={
          currentSemesterId
            ? getSemesterTextFromId(currentSemesterId)
            : undefined
        }
        all={all}
        hidden={hidden}
        itemComponent={CourseCard}
        navigation={navigation}
        onItemPress={handlePush}
        refreshing={fetching}
        onRefresh={handleRefresh}
      />
    </SafeArea>
  );
};

export default Courses;
