export const socketHandler = (io) => {
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Join room based on user role
    socket.on('join-room', (data) => {
      const { userId, role, roomId } = data;
      
      if (role === 'committee' && roomId) {
        socket.join(`room-${roomId}`);
        console.log(`Committee member ${userId} joined room ${roomId}`);
      } else if (role === 'admin') {
        socket.join('admin-dashboard');
        console.log(`Admin ${userId} joined admin dashboard`);
      } else {
        socket.join(`student-${userId}`);
        console.log(`Student ${userId} joined personal room`);
      }
    });

    // Handle interview status updates
    socket.on('interview-started', (data) => {
      const { interviewId, roomId, studentId } = data;
      
      // Notify admin dashboard
      io.to('admin-dashboard').emit('interview-update', {
        type: 'started',
        interviewId,
        roomId,
        timestamp: new Date()
      });

      // Notify student
      io.to(`student-${studentId}`).emit('interview-started', {
        interviewId,
        message: 'Your interview has started'
      });
    });

    socket.on('interview-ended', (data) => {
      const { interviewId, roomId, studentId, nextStudentId } = data;
      
      // Notify admin dashboard
      io.to('admin-dashboard').emit('interview-update', {
        type: 'ended',
        interviewId,
        roomId,
        timestamp: new Date()
      });

      // Notify completed student
      io.to(`student-${studentId}`).emit('interview-completed', {
        interviewId,
        message: 'Your interview has been completed'
      });

      // Notify next student
      if (nextStudentId) {
        io.to(`student-${nextStudentId}`).emit('next-in-queue', {
          message: 'You are next for the interview',
          roomId
        });
      }
    });

    // Handle queue updates
    socket.on('queue-updated', (data) => {
      const { companyId, queueData } = data;
      
      // Notify all affected students
      queueData.forEach((item, index) => {
        io.to(`student-${item.studentId}`).emit('queue-position-update', {
          companyId,
          position: index + 1,
          estimatedTime: item.estimatedTime
        });
      });

      // Notify admin dashboard
      io.to('admin-dashboard').emit('queue-update', {
        companyId,
        queueData
      });
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });
};