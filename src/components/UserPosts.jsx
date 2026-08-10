import { useQuery } from '@tanstack/react-query'
import Post from './Post'
import { getUserPosts } from '../Services/UserDetailsServices'



export default function UserPosts({userID}) {

    const { data, isLoading, refetch, isError } = useQuery({
        queryKey: ['userPosts', userID],
        queryFn: () => getUserPosts(userID),
        enabled: !!userID,
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
        refetchOnMount: true,
        retry: 2,
        staleTime : 30000,
    })

    return (
      <>
        {isLoading ? (
          ''
        ) : isError ? (
          ''
        ) : (
          [...(data.data.data.posts || [])].reverse().map((post) => (
            <div className='mb-4' key={post._id}>
                <Post
                    post={post}
                    getUserPosts={refetch}
                    commentLimit={1}
                    from={'userProfilePage'}
                />
            </div>
          ))
        )}
      </>
    );
    
}
