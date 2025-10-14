import React, { useState } from 'react';
import ServiceSidebar from './ServiceSidebar';
import ChannelList from './ChannelList';
import PostFeed from './PostFeed';
import styles from './Feed.module.css';

export default function FeedPage() {
  const [selectedService, setSelectedService] = useState('discord');
  const [selectedChannel, setSelectedChannel] = useState(null);

  return (
    <div className={styles.feedLayout}>
      <ServiceSidebar onSelect={setSelectedService} />
      <div className={styles.mainContent}>
        <header className={styles.header}>
        </header>
        <div className={styles.contentBody}>
          <ChannelList serviceId={selectedService} onSelect={setSelectedChannel} />
          <PostFeed channelId={selectedChannel} />
        </div>
      </div>
    </div>
  );
}