import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import type { RootState } from '../../app/store';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchEmployerDetailById, clearEmployerDetail } from './slice';

export const useEmployerDetail = () => {
    const dispatch = useAppDispatch();
    const { id } = useParams<{ id: string }>();
    

    const { profile, jobs, loading, error } = useAppSelector(
        (state: RootState) => state.employerDetail
    );

    useEffect(() => {
        if (id && id !== 'undefined') {
            dispatch(fetchEmployerDetailById(id));
        } else {
            dispatch(clearEmployerDetail());
        }

        return () => {
            dispatch(clearEmployerDetail());
        };
    }, [dispatch, id]);

    return { profile, jobs, loading, error };
};
